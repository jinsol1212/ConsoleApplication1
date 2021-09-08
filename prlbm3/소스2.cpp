#include <iostream>
#include <cstdlib>
#include <ctime>
#include <Windows.h>
using namespace std;

class Circle {
public:
	int x, y;
	int radius;
	Circle() : x(0), y(0), radius(0) {}
	void print() {
		cout << "¹ÝÁö¸§: " << radius << " @(" << x << ", " << y << ")" << endl;
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
	for (Circle& c : abjArray) {
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