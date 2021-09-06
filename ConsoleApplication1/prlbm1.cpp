#include <iostream>
using namespace std;

class Person {
public:
	int money;
	static int sharedMoney;
	void addMoney(int num);
	void addShared(int num);
}; int Person::sharedMoney = 0;

void Person::addMoney(int num) {
	money += num;
}

void Person::addShared(int num) {
	sharedMoney += num;
}
int main() {
	Person han;
	han.money = 100; // han의 개인 돈=100
	han.sharedMoney = 200; // static 멤버 접근, 공금=200
	Person lee;
	lee.money = 150; // lee의 개인 돈=150
	lee.addMoney(200); // lee의 개인 돈=350
	lee.addShared(200); // static 멤버 접근, 공금=400
	cout << han.money << ' ' << lee.money << endl;
	cout << han.sharedMoney << ' ' << lee.sharedMoney << endl;
}