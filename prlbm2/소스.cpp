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
	Board::add("�߰����� ���� ���� ���� �����Դϴ�.");
	Board::add("�ڵ� ����� ���� �̿��� �ּ���.");
	Board::print();
	Board::add("���Ҹ� �л��� ������ȸ �Ի��Ͽ����ϴ�. �������ּ���");
	Board::print();
}