/*#include <iostream>
#include<cstdlib>
#include<ctime>

using namespace std;
//GameŬ���� ����

class Game {
private:
double energy = 100;


public:
Game();
double Damage();
static void Die();
static int life;
};
int Game::life = 10;

void Game::Die() {
life--;
cout << "**������ 1 �����Ͽ� " << life << "�� �Ǿ����ϴ�." << endl << endl;
if (life == 0) {
	cout << "ĳ���Ͱ� ����߽��ϴ�." << endl;
	
}
}
double Game::Damage() {s
double damaged = 0;

if (energy > 0) {
damaged += rand() % 100;
energy -= damaged;
cout << "�������� " << damaged << " �����Ͽ� " << energy << " �� �Ǿ����ϴ�.\n";
if (energy < 0) {
life--;
energy = 100;
cout << "������ 1 �����Ͽ� " << life << "�� �Ǿ����ϴ�." << endl << endl;

}
}
return energy;
}
//GameŬ���� ��� �Լ��� ����
Game::Game()
{
cout << "�������� " << energy << " �̸�, ������ " << life << "�� ĳ���Ͱ� ����������ϴ�.\n";
Damage();
Damage();
Damage();
Damage();
Damage();

}

int main()
{
srand((unsigned int)time(NULL)); //seed������ ����ð� �ο�
Game c1;
Game::Die();
Game c2;
while (Game::life >0) {
	c2.Damage();
	c2.Die();
}

return 0;
}*/

#include <iostream>
#include <cstdlib>
#include <ctime>
#include <Windows.h>
using namespace std;

class Circle {
public:
	int x, y;
	int radius;
	Circle(): x(0), y(0), radius(0) {}
	void print() {
		cout << "������: " << radius << " @(" << x << ", " << y << ")" << endl;
	}
	void draw() {
		int r = radius / 2;
		HDC hdc = GetWindowDC(GetForegroundWindow());
		Ellipse(hdc, x - r, y - r, x + r, y + r);
	}
};
int main() {
	srand(time(NULL));
	Circle abjArray[10];
	for (Circle& c: abjArray) {
		c.x = rand() % 500;
		c.y = rand() % 300;
		c.radius = rand() % 100;
	}
	for (Circle& c : abjArray) {
		//c.print();
		c.draw();
		return 0;
	}
}


/*#include <iostream>
#include <vector>

using namespace std;

int main() {
	vector<int> vec;

	vec.push_back(10);
	vec.push_back(20);
	vec.push_back(30);

	for (int i = 0; i < vec.size(); i++) {
		cout << i << "��° ����: " << vec[i] << endl;
	}
	vec.pop_back();

	cout << endl;
	for (int i = 0; i < vec.size(); i++) {
		cout << i << "��° ����" << vec[i] << endl;
	}
	return 0;
}*/