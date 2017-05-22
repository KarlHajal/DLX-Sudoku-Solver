
var completion;
var solveBtn = document.getElementById("SolveButton");
var resetBtn = document.getElementById("ResetButton");
solveBtn.addEventListener('click', StartSolve);
resetBtn.addEventListener('click', ResetGrid);

function StartSolve(){
  completion = false;
	
	var Sudoku = [];
	var Filled = [];
	
	for(var i = 0; i<9; i++){
		Filled.push(0);
	}

	for(var i =0;i<9;i++)
		Sudoku.push(Filled.slice());
	
	Filled.push(0);
	
	var str = "R1C1";
	
	for(var i = 1; i<10; i++){
		str = str.slice(0,1) + i + str.slice(2,3);
		for(var j = 1; j<10; j++){
			str = str.slice(0,3)+j;
			var value = document.getElementById(str).value;
			if(value > 0)
				Sudoku[i-1][j-1] = value;
		}
	}
	
	SolvePuzzle(Sudoku,Filled,0,0);
	
}

function SolvePuzzle(Sudoku,Filled,row,col){
	


	if (row == 9){ //if row == 9, it means that the last position has been filled --> the puzzle has been solved
		SolvedPuzzleOutput(Sudoku);
		completion = true; //We set completion to true to release all stack frames
	}
  
	else if(Sudoku[row][col]>0){ //Current Position is filled
		if(col == 8)
			SolvePuzzle(Sudoku,Filled,row+1,0);
		else
			SolvePuzzle(Sudoku,Filled,row,col+1);
	}
	
	else { //Fill current position
	  for(var l = 1; l<10;l++){ //We try all possible numbers		
		  CheckBoard(Sudoku, Filled, row, col);
			
			if(!Filled[l]){ //if Filled[l] == false, then l is a possibility --> we proceed
				Sudoku[row][col] = l;
				if(col == 8)
					SolvePuzzle(Sudoku, Filled, row+1, 0);
				else
					SolvePuzzle(Sudoku, Filled, row, col+1);
			}
		}
		
		if(!completion){ //If the puzzle is complete we would like to maintain Sudoku[][] in its solved state
			Sudoku[row][col]=0;
			if(row==0 && col==0){
				alert("Invalid Sudoku Puzzle");
				ResetGrid();
			}
			
		}
	}
	
}


function CheckBoard(Sudoku,Filled,row,col){

	for(var i=0; i<10; i++)
		Filled[i] = false;

	//Check Horizontal & Vertical
	for(var i=0; i<9; i++){
		if(Sudoku[row][i]!=0)
			Filled[Sudoku[row][i]] = true;
		if(Sudoku[i][col]!=0)
			Filled[Sudoku[i][col]]=true;
	}

	//Check Box
	//It is located between (rowStart,colStart) and (rowStart+3, colStart+3)
	var rowStart = 0;
	if(row>2)
		rowStart+=3;
	if(row>5)
		rowStart +=3;

	var colStart = 0;
	if(col>2)
		colStart += 3;
	if(col>5)
		colStart += 3;

	for(var i = rowStart; i<rowStart+3; i++)
		for(var k = colStart; k<colStart+3; k++)
			if(Sudoku[i][k]!=0)
				Filled[Sudoku[i][k]]=true;
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
}

function limitKey(evt,num){
    var key = window.evt? evt.keyCode : evt.which; 
    if(key<49||key>57) return false; 
    else if(num.length == 1) return false; 
    else return true;
  }