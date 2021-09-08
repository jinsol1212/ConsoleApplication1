#include<iostream>
#include<vector>
using namespace std;

int main() {
	vector <int> v;
	int user_input = 0;
	int sum = 0;
	float average = 0.0;
	while (1) {
		cout << "성적을 입력하세요(종료는 -1 입력): ";
		cin >> user_input;
		if (user_input == -1)
			break;
		v.push_back(user_input);
	}
	for (auto& element : v) {
		sum += element;
	}
	average = (float)sum / v.size();
	cout << "평균 : " << average << endl;
}