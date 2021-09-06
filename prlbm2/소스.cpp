#include <iostream>
using namespace std;

class Board {
public:
	static void add(string str);
	static void print();
	static string gg[10];
	static int cnt;
};
int Board::cnt = {};
string Board::gg[10] = {};
void Board::add(string str) {
	
}
void Board::print() {
	
}

int main() {
	Board::add("중간고사는 감독 없는 자율 시험입니다.");
	Board::add("코딩 라운지 많이 이용해 주세요.");
	Board::print();
	Board::add("진소린 학생이 경진대회 입상하였습니다. 축하해주세요");
	Board::print();
}