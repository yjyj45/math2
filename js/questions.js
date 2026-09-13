// 4학년 1학기 분수의 덧셈과 뺄셈 - 문제 생성기 (분모가 같은 분수, 약분/통분 없음)
(function (global) {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 1. 진분수 + 진분수
  function genType1() {
    while (true) {
      const den = randInt(3, 9);
      const n1 = randInt(1, den - 1);
      const n2 = randInt(1, den - 1);
      const sum = n1 + n2;
      if (sum === den) continue; // 결과가 자연수만 남는 경우 제외
      let whole = 0;
      let num = sum;
      if (sum > den) {
        whole = 1;
        num = sum - den;
      }
      return {
        category: 1,
        op: '+',
        left: { num: n1, den },
        right: { num: n2, den },
        answer: { whole, num, den },
      };
    }
  }

  // 2. 대분수 + 대분수
  function genType2() {
    while (true) {
      const den = randInt(3, 9);
      const w1 = randInt(1, 5);
      const w2 = randInt(1, 5);
      const n1 = randInt(1, den - 1);
      const n2 = randInt(1, den - 1);
      const sumN = n1 + n2;
      if (sumN === den) continue;
      let whole = w1 + w2;
      let num = sumN;
      if (sumN > den) {
        whole += 1;
        num = sumN - den;
      }
      return {
        category: 2,
        op: '+',
        left: { whole: w1, num: n1, den },
        right: { whole: w2, num: n2, den },
        answer: { whole, num, den },
      };
    }
  }

  // 3. 진분수 - 진분수 / 1 - 진분수
  function genType3() {
    if (Math.random() < 0.5) {
      while (true) {
        const den = randInt(3, 9);
        let n1 = randInt(1, den - 1);
        let n2 = randInt(1, den - 1);
        if (n1 === n2) continue;
        if (n1 < n2) [n1, n2] = [n2, n1];
        return {
          category: 3,
          op: '-',
          left: { num: n1, den },
          right: { num: n2, den },
          answer: { whole: 0, num: n1 - n2, den },
        };
      }
    }
    const den = randInt(3, 9);
    const n = randInt(1, den - 1);
    return {
      category: 3,
      op: '-',
      left: { whole: 1 },
      right: { num: n, den },
      answer: { whole: 0, num: den - n, den },
    };
  }

  // 4. 받아내림이 없는 대분수 - 대분수
  function genType4() {
    const den = randInt(3, 9);
    const n2 = randInt(1, den - 2);
    const n1 = randInt(n2 + 1, den - 1);
    const w2 = randInt(1, 4);
    const w1 = randInt(w2 + 1, w2 + 4);
    return {
      category: 4,
      op: '-',
      left: { whole: w1, num: n1, den },
      right: { whole: w2, num: n2, den },
      answer: { whole: w1 - w2, num: n1 - n2, den },
    };
  }

  // 5. 1보다 큰 자연수 - 대분수
  function genType5() {
    const den = randInt(3, 9);
    const b = randInt(1, 4);
    const a = randInt(b + 1, b + 5);
    const n = randInt(1, den - 1);
    return {
      category: 5,
      op: '-',
      left: { whole: a },
      right: { whole: b, num: n, den },
      answer: { whole: a - b - 1, num: den - n, den },
    };
  }

  // 6. 대분수 - 대분수 (받아내림 있음)
  function genType6() {
    const den = randInt(4, 9);
    const n2 = randInt(2, den - 1);
    const n1 = randInt(1, n2 - 1);
    const w2 = randInt(1, 4);
    const w1 = randInt(w2 + 1, w2 + 4);
    return {
      category: 6,
      op: '-',
      left: { whole: w1, num: n1, den },
      right: { whole: w2, num: n2, den },
      answer: { whole: w1 - 1 - w2, num: n1 + den - n2, den },
    };
  }

  // 7. 전체 내용
  function genType7() {
    const gens = [genType1, genType2, genType3, genType4, genType5, genType6];
    return gens[randInt(0, gens.length - 1)]();
  }

  const GENERATORS = {
    1: genType1,
    2: genType2,
    3: genType3,
    4: genType4,
    5: genType5,
    6: genType6,
    7: genType7,
  };

  function generateQuestion(categoryId) {
    const gen = GENERATORS[categoryId] || genType7;
    return gen();
  }

  global.QuestionBank = { generateQuestion };
})(window);
