'use strict'

module.exports = {
  isMutant (dna) {
    let mutant = false
    for (let i = 0; i < dna.length; i++) {
      for (let j = 0; j < dna[i].length; j++) {
        const l = dna[i][j]

        const canCheckHorizontal = (j < dna[i].length - 3)
        const canCheckDiagonalDec = (i < dna.length - 3 && j < dna[i].length - 3)
        const canCheckDiagonalInc = (i - 3 >= 0 && j < dna[i].length - 3)
        const canCheckVertical = (i < dna.length - 3)

        const horizontal = () => l === dna[i][j + 1] && l === dna[i][j + 2] && l === dna[i][j + 3]
        const diagonalDec = () => l === dna[i + 1][j + 1] && l === dna[i + 2][j + 2] && l === dna[i + 3][j + 3]
        const diagonalInc = () => l === dna[i - 1][j + 1] && l === dna[i - 2][j + 2] && l === dna[i - 3][j + 3]
        const vertical = () => l === dna[i + 1][j] && l === dna[i + 2][j] && l === dna[i + 3][j]

        if ((canCheckHorizontal && horizontal()) ||
          (canCheckDiagonalDec && diagonalDec()) ||
          (canCheckDiagonalInc && diagonalInc()) ||
          (canCheckVertical && vertical())) {
          mutant = true
          break
        }
      }
    }
    return mutant
  }
}
