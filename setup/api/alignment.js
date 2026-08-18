function align(a, b, match = 2, mismatch = -1, gap = -2) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * gap;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gap;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const s = a[i - 1] === b[j - 1] ? match : mismatch;
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + s,
        dp[i - 1][j] + gap,
        dp[i][j - 1] + gap
      );
    }
  }

  let i = n, j = m, alignedA = '', alignedB = '';
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? match : mismatch)) {
      alignedA = a[i - 1] + alignedA; alignedB = b[j - 1] + alignedB; i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + gap) {
      alignedA = a[i - 1] + alignedA; alignedB = '-' + alignedB; i--;
    } else {
      alignedA = '-' + alignedA; alignedB = b[j - 1] + alignedB; j--;
    }
  }

  let matches = 0;
  for (let k = 0; k < alignedA.length; k++) {
    if (alignedA[k] === alignedB[k] && alignedA[k] !== '-') matches++;
  }
  const identity = matches / Math.max(a.length, b.length, 1);

  return { alignedA, alignedB, identity };
}

module.exports = { align };
