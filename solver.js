var completion;
var solveBtn = document.getElementById("SolveButton");
var resetBtn = document.getElementById("ResetButton");
solveBtn.addEventListener('click', SolveSudoku);
resetBtn.addEventListener('click', ResetGrid);

var MAX_K = 1000;
var SIZE = 9;
//var SIZE = 4;
var SIZE_SQUARED = SIZE*SIZE;
var SIZE_SQRT = Math.sqrt(SIZE);
var ROW_NB = SIZE*SIZE*SIZE;
var COL_NB = 4*SIZE*SIZE;

//Node Object Constructor
function Node(){ 
	this.left = this;
	this.right = this;
	this.up = this;
	this.down = this;
	this.head = this;
	this.size = 0;
	this.rowID = [0,0,0];
}

var HeadNode = new Node();
var solution = [];
var orig_values = [];

var Grid = [];
var matrix = [];
var row = [];
for(var i = 0; i<COL_NB; i++){
	row.push(0);
}
for(var i = 0; i<ROW_NB;i++){
	matrix.push(row.slice());
}
var isSolved = false;

function SolveSudoku(){
	BuildSparseMatrix(matrix);
	BuildLinkedList(matrix);

	var Sudoku = [];
	var tempRow = [];
	for(var i = 0; i<SIZE; i++)
		tempRow.push(0);
	for(i =0;i<SIZE;i++)
		Sudoku.push(tempRow.slice());

	var str = "R1C1";
	for(i = 1; i<10; i++){
		str = str.slice(0,1) + i + str.slice(2,3);
		for(var j = 1; j<10; j++){
			str = str.slice(0,3)+j;
			var value = Number(document.getElementById(str).value);
			if(value > 0)
				Sudoku[i-1][j-1] = value;
		}
	}
	
	TransformListToCurrentGrid(Sudoku);
	Search(0);
	if(!isSolved)
		document.getElementById("SolvedText").innerHTML = "No Solution";
	else
		document.getElementById("SolvedText").innerHTML = "Solved!";
	isSolved=false;
}

//===============================================================================================================//
//---------------------------------------------DLX Functions-----------------------------------------------------//
//===============================================================================================================//

function CoverColumn(col){
	col.left.right = col.right;
	col.right.left = col.left;
	for(var node = col.down; node!==col; node = node.down){
		for(var temp = node.right; temp!==node; temp = temp.right){
			temp.down.up = temp.up;
			temp.up.down = temp.down;
			temp.head.size--;
		}
	}
}

function UncoverColumn(col){
	for (var node = col.up; node!== col; node = node.up){
		for(var temp = node.left; temp!==node; temp = temp.left){
			temp.head.size++;
			temp.down.up = temp;
			temp.up.down = temp;
		}
	}
	col.left.right = col;
	col.right.left = col;
}

function Search(k){
	
	if(HeadNode.right === HeadNode){
		var tempRow = [];
		for(var u = 0; u<SIZE; u++){
			tempRow.push(0);
		}
		for(u = 0; u<SIZE; u++){
			Grid.push(tempRow.slice());
		}
		MapSolutionToGrid(Grid);
		SolvedPuzzleOutput(Grid);
		isSolved = true;
		return;
	}
	if(!isSolved){
		//Choose Column Object Deterministically: Choose the column with the smallest Size
		var Col = HeadNode.right;
		for(var temp = Col.right; temp.size>-1; temp = temp.right){
			if(temp.size < Col.size){
				Col = temp;
			}
		}
		CoverColumn(Col);
		
		for(temp = Col.down; temp!==Col; temp = temp.down){
			solution[k] = temp;
			for(var node = temp.right; node!==temp; node = node.right){
				CoverColumn(node.head);
			}
			
			Search(k+1);

			temp = solution[k];
			solution[k]=null;
			Col = temp.head;
			for(node = temp.left; node!==temp; node = node.left){
				UncoverColumn(node.head);
			}
		}
		
		UncoverColumn(Col);
	}
}

//===============================================================================================================//
//----------------------Functions to turn a Sudoku grid into an Exact Cover problem -----------------------------//
//===============================================================================================================//

//--------------------------BUILD THE INITIAL MATRIX CONTAINING ALL POSSIBILITIES--------------------------------//
function BuildSparseMatrix(matrix){
	var j = 0, counter = 0;
	//Constraint 1 : There can only be one value in any given cell
	for (var i = 0; i < ROW_NB; i++){
		matrix[i][j] = 1;
		counter++;
		if(counter >= SIZE){
			j++;
			counter = 0;
		}
	}

	//Constraint 2 : There can only be one instance of a number in any given row
	var x = 0;
	counter = 1;
	for(j = SIZE_SQUARED; j<2*SIZE_SQUARED; j++){
		for (i = x; i < counter*SIZE_SQUARED; i += SIZE)
			matrix[i][j] = 1;

		if ((j + 1) % SIZE === 0) {
			x = counter*SIZE_SQUARED;
			counter++;
		}
		else
			x++;
	}

	//Constraint 3: There can only be one instance of a number in any given column
	j = 2 * SIZE_SQUARED;
	for (i = 0; i < ROW_NB; i++){
		matrix[i][j] = 1;
		j++;
		if (j >= 3 * SIZE_SQUARED)
			j = 2 * SIZE_SQUARED;
	}

	//Constraint 4: There can only be one instance of a number in any given region
	x = 0;
	for (j = 3 * SIZE_SQUARED; j < COL_NB; j++) {

		for (var l = 0; l < SIZE_SQRT; l++) {
			for (var k = 0; k<SIZE_SQRT; k++)
				matrix[x + l*SIZE + k*SIZE_SQUARED][j] = 1;
		}

		var temp = j + 1 - 3 * SIZE_SQUARED;

		if (temp % (SIZE_SQRT * SIZE) === 0)
			x += (SIZE_SQRT - 1)*SIZE_SQUARED + (SIZE_SQRT - 1)*SIZE + 1;
		else if (temp % SIZE === 0)
			x += SIZE*(SIZE_SQRT - 1) + 1;
		else
			x++;
	}
}

//-------------------BUILD A TOROIDAL DOUBLY LINKED LIST OUT OF THE SPARSE MATRIX-------------------------//
function BuildLinkedList(matrix){
	var header = new Node();
	header.size = -1;
	
	var temp = header;
	//Create all Column Nodes
	for (var i = 0; i<COL_NB; i++){
		var newNode = new Node();
		newNode.left = temp;
		newNode.right = header;
		temp.right = newNode;
		temp = newNode;
	}
	
	var ID = [0,1,1];
	//Add a Node for each 1 present in the sparse matrix and update Column Nodes accordingly
	for(i = 0; i<ROW_NB; i++){
		var topNode = header.right;
		var prev = 5;
		
		if(i !== 0 && i%SIZE_SQUARED === 0){
			ID= new Array(ID[0]-(SIZE-1),ID[1]+1,ID[2]-(SIZE-1));
		}
		else if(i!==0 && i%SIZE === 0){
			ID = new Array(ID[0]-(SIZE-1),ID[1],ID[2]+1);			
		}
		else{
			ID = new Array(ID[0]+1,ID[1],ID[2]);
		}
		
		for(var j = 0; j<COL_NB; j++, topNode = topNode.right){
			if(matrix[i][j] === 1){
				var tempNode = new Node();
				tempNode.rowID = ID;
				if(prev === 5){
					prev = tempNode;
				}
				tempNode.left = prev;
				tempNode.right = prev.right;
				tempNode.right.left = tempNode;
				prev.right = tempNode;
				tempNode.head = topNode;
				tempNode.down = topNode;
				tempNode.up = topNode.up;
				topNode.up.down = tempNode;
				topNode.up = tempNode;
				if(topNode.size === 0){
					topNode.down = tempNode;
				}
				topNode.size++;
				prev = tempNode;
			}
		}
	}
	HeadNode = header;
}

//-------------------COVERS VALUES THAT ARE ALREADY PRESENT IN THE GRID-------------------------//
function TransformListToCurrentGrid(Puzzle){
	orig_values = [];
	for(var n=0; n<SIZE; n++){
		for(var m=0; m<SIZE; m++){
			if(Puzzle[n][m] > 0){
				loop1:
				for(var Col = HeadNode.right; Col!==HeadNode; Col = Col.right){
					loop2:
					for(temp = Col.down; temp!==Col; temp = temp.down){
						if(temp.rowID[0] === Puzzle[n][m] && (temp.rowID[1]-1) == n && (temp.rowID[2]-1) == m){
							break loop1;
						}
					}
				}
				CoverColumn(Col);
				orig_values.push(temp);
				for(var node = temp.right; node!=temp; node = node.right){
					CoverColumn(node.head);
				}
			}
		}
	}
}

//===============================================================================================================//
//----------------------------------------------- Print Functions -----------------------------------------------//
//===============================================================================================================//

function MapSolutionToGrid(grid){
	for(var t=0; solution[t] != null; t++){
		grid[solution[t].rowID[1]-1][solution[t].rowID[2]-1] = solution[t].rowID[0];
	}
	for(t=0; orig_values[t] != null; t++){
		grid[orig_values[t].rowID[1]-1][orig_values[t].rowID[2]-1] = orig_values[t].rowID[0];
	}
}

function SolvedPuzzleOutput(Sudoku){
	
	str = "R1C1";
	for(var i = 1; i<10; i++){
		str = str.slice(0,1) + i + str.slice(2,3);
		for(var j = 1; j<10; j++){
				str = str.slice(0,3)+j;
				var textField = document.getElementById(str);
				if(textField.value == '')
					textField.style.color = "#000000";
				textField.value = Sudoku[i-1][j-1];
				//textField.disabled = true;
				textField.readOnly = true;
			
		}
	}
}

function ResetGrid(){
	
	str = "R1C1";
	for(var i = 1; i<10; i++){
		str = str.slice(0,1) + i + str.slice(2,3);
		for(var j = 1; j<10; j++){
				str = str.slice(0,3)+j;
				var textField = document.getElementById(str);
				//textField.disabled = false;
				textField.readOnly = false;
			textField.value = "";
			textField.style.color = "red";
		}
	}
	document.getElementById("SolvedText").innerHTML = "&nbsp";
}

function limitKey(evt,num){
	var key = window.evt? evt.keyCode : evt.which; 
	if(key<49||key>57) return false; 
	else if(num.length == 1) return false; 
	else return true;
}