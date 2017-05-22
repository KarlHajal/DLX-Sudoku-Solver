#include <iostream>
#include <ctime>

using namespace std;

void CheckBoard(int Sudoku[][9], bool Filled[], int row, int col); //Checks what possible numbers can be placed in a given position
void SolvePuzzle(int Sudoku[][9], bool Filled[], int row, int col); //Solves the Sudoku Puzzle
void PrintBoard(int Puzzle[][9]); //Print the Sudoku Puzzle in its current state
bool completion = false; //Used to release all stack frames
void StartSolve(int Sudoku[][9], bool Filled[10]);

void SolvePuzzle(int Sudoku[][9], bool Filled[], int row, int col)
{

	if(completion) //completion is true when the puzzle has been solved
	{
		if(row == 0 && col == 0) //if we are in the starting position, then we are calling this function after having solved a previous puzzle
		{						 //We need to reinitialize
			completion = false;
			SolvePuzzle(Sudoku, Filled, 0, 0);
		}
	}

	else if(row == 9) //if row == 9 it means that the last position has been filled --> The puzzle has been solved
	{
		cout<<"Success!" <<endl <<endl;
		completion = true; //Set completion to true to release all stack frames
	}

	else if(Sudoku[row][col] > 0) //Current position is filled
	{
		//condition for no solution
		if(col == 8)
			SolvePuzzle(Sudoku, Filled, row+1, 0);
		else
			SolvePuzzle(Sudoku, Filled, row, col+1);
	}

	else //Fill Current position
	{

		for(int l=1;l<10;l++) //We try all possible numbers
		{
			CheckBoard(Sudoku, Filled, row, col); //Set in Filled[] what numbers have already been placed

			if(!Filled[l]) //if Filled[l] == false, then l is a possibility --> we proceed
			{			
				Sudoku[row][col] = l;		
				if(col == 8)
					SolvePuzzle(Sudoku, Filled, row+1, 0);
				else
					SolvePuzzle(Sudoku, Filled, row, col+1);
			}
		}
		
		if(!completion) //If the puzzle is complete, we would like to maintain Sudoku[][] in its solved state
		{
			Sudoku[row][col] = 0;
			if (row == 0 && col == 0)
				cout << "Invalid Grid" << endl;
		}
	}
}


int main()
{
	//Empty Puzzle
	int EmptyPuzzle[9][9] = {                   {0,0,0,  0,0,0,  0,0,0},
		 			                            {0,0,0,  0,0,0,  0,0,0},
     	 			                            {0,0,0,  0,0,0,  0,0,0},
 
 					                            {0,0,0,  0,0,0,  0,0,0},
					                            {0,0,0,  0,0,0,  0,0,0},
					                            {0,0,0,  0,0,0,  0,0,0},
 
 					                            {0,0,0,  0,0,0,  0,0,0},
					                            {0,0,0,  0,0,0,  0,0,0},
					                            {0,0,0,  0,0,0,  0,0,0}
							};
	//Hardest Sudoku Puzzle in the World
	int Puzzle[9][9] = {                        {8,0,0,  0,0,0,  0,0,0},
		 			                            {0,0,3,  6,0,0,  0,0,0},
     	 			                            {0,7,0,  0,9,0,  2,0,0},
 
 					                            {0,5,0,  0,0,7,  0,0,0},
					                            {0,0,0,  0,4,5,  7,0,0},
					                            {0,0,0,  1,0,0,  0,3,0},
 
 					                            {0,0,1,  0,0,0,  0,6,8},
					                            {0,0,8,  5,0,0,  0,1,0},
					                            {0,9,0,  0,0,0,  4,0,0}
	                    };
	//Hard Sudoku for Brute Force
	int HardPuzzle[9][9] = {					{0,0,0,  0,0,0,  0,0,0},
		 			                            {0,0,0,  0,0,3,  0,8,5},
     	 			                            {0,0,1,  0,2,0,  0,0,0},
 
 					                            {0,0,0,  5,0,7,  0,0,0},
					                            {0,0,4,  0,0,0,  1,0,0},
					                            {0,9,0,  0,0,0,  0,0,0},
 
 					                            {5,0,0,  0,0,0,  0,7,3},
					                            {0,0,2,  0,1,0,  0,0,0},
					                            {0,0,0,  0,4,0,  0,0,9}
	                    };

	bool Filled[10] = {0}, Filled2[10] = {0}, Filled3[10] = {0};
	clock_t timer;

	PrintBoard(EmptyPuzzle);
	timer = clock();
	SolvePuzzle(EmptyPuzzle, Filled2, 0, 0);
	timer = clock() - timer;
	PrintBoard(EmptyPuzzle);

	cout<<"Time Elapsed: " <<(float)timer/CLOCKS_PER_SEC <<" seconds." <<endl <<endl;


	PrintBoard(Puzzle);
	timer = clock();
	//SolvePuzzle(Puzzle, Filled, 0, 0);
	StartSolve(Puzzle, Filled);
	timer = clock() - timer;
	PrintBoard(Puzzle);

	cout<<"Time Elapsed: " <<(float)timer/CLOCKS_PER_SEC <<" seconds." <<endl <<endl;

	PrintBoard(HardPuzzle);
	timer = clock();
	//SolvePuzzle(HardPuzzle, Filled3, 0, 0);
	StartSolve(HardPuzzle, Filled3);
	timer = clock() - timer;
	PrintBoard(HardPuzzle);

	cout<<"Time Elapsed: " <<(float)timer/CLOCKS_PER_SEC <<" seconds." <<endl <<endl;


	system("pause");
	return 0;
}

void StartSolve(int Sudoku[][9], bool Filled[10])
{
	int count1 = 0, count2 = 0;

	for (int i = 0; i < 9; i++)
	{
		if (Sudoku[0][i] > 0)
			count1++;
		if (Sudoku[8][i] > 0)
			count2++;
	}

	if (count2 > count1+1)
	{
		int temp;
		for (int i = 0; i < 4; i++)
			for (int j = 0; j < 9; j++)
				swap(Sudoku[i][j], Sudoku[8 - i][j]);

		SolvePuzzle(Sudoku, Filled, 0, 0);

		for (int i = 0; i < 4; i++)
			for (int j = 0; j < 9; j++)
				swap(Sudoku[i][j], Sudoku[8 - i][j]);

		return;
	}

	SolvePuzzle(Sudoku, Filled, 0, 0);
}

void CheckBoard(int Sudoku[][9], bool Filled[], int row, int col)
{
	int i,k;

	for(i=0; i<10; i++)
		Filled[i] = false;

	//Check Horizontal & Vertical
	for(i=0; i<9; i++)
	{
		if(Sudoku[row][i] != 0)
			Filled[Sudoku[row][i]] = true;
		if(Sudoku[i][col] != 0)
			Filled[Sudoku[i][col]] = true;
	}

	//Check Box
	//It is located between (rowStart,ColStart) and (rowStart+3,colStart+3)
	int rowStart = 0;
	if(row>2)
		rowStart += 3;
	if(row>5)
		rowStart += 3;

	int colStart = 0;
	if(col>2)
		colStart += 3;
	if(col>5)
		colStart += 3;

	for(i = rowStart; i < rowStart+3;i++)
		for(k = colStart; k < colStart+3; k++)
			if(Sudoku[i][k]!=0)
					Filled[Sudoku[i][k]]=true;
}

void PrintBoard(int Puzzle[][9])
{
	cout<<"+-----------------------+"<<endl;
	for(int i=0; i<9; i++)
		{
			
			cout<<"| ";
			for(int j=0; j<9; j++)
			{
				if(Puzzle[i][j] == 0)
					cout<<". ";
				else
					cout<<Puzzle[i][j] <<" ";
				if(j==2 || j==5 || j==8)
					cout<<"| ";
			}
			cout<<endl;
			if(i==2 || i==5)
				cout<<"|-------+-------+-------|" <<endl;
		}
	cout<<"+-----------------------+"<<endl <<endl;
}