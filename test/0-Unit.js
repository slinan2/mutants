'use strict'

const Lab = require('lab')
const Code = require('code')
const mutantLogic = require('../src/logic/mutant')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const expect = Code.expect
const it = lab.it

function buildTestHumanDna (n) {
  let dna = []
  const times = Math.trunc(n / 4)
  const evenRow = 'GATC'.repeat(times)
  const oddRow = 'TCGA'.repeat(times)
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      dna.push(evenRow)
    } else {
      dna.push(oddRow)
    }
  }
  return dna
}

describe('Mutants (Unit)', () => {
  it('Validate 4x4 horizontal mutants', async () => {
    expect(
      mutantLogic.isMutant(['AAAA', 'GATA', 'ATAC', 'TTCG'])
    ).to.equal(true)
    expect(
      mutantLogic.isMutant(['GATA', 'GGGG', 'ATAC', 'TTCG'])
    ).to.equal(true)
    expect(
      mutantLogic.isMutant(['TTCG', 'GATA', 'CCCC', 'TTCG'])
    ).to.equal(true)
    expect(
      mutantLogic.isMutant(['AAAA', 'GATA', 'ATAC', 'GGGG'])
    ).to.equal(true)
  })

  it('Validate 4x4 vertical mutants', async () => {
    expect(
      mutantLogic.isMutant(['GATA', 'GATA', 'GTAC', 'GTCG'])
    ).to.equal(true)
    expect(
      mutantLogic.isMutant(['GATA', 'GATA', 'GAAC', 'GACG'])
    ).to.equal(true)
    expect(
      mutantLogic.isMutant(['TTCG', 'GACA', 'AGCA', 'TTCG'])
    ).to.equal(true)
    expect(
      mutantLogic.isMutant(['AAAT', 'GATT', 'ATAT', 'GGGT'])
    ).to.equal(true)
  })

  it('Validate 4x4 diagonal increasing mutant', async () => {
    expect(
      mutantLogic.isMutant(['GATG', 'GAGA', 'GGAC', 'GTCG'])
    ).to.equal(true)
  })

  it('Validate 4x4 diagonal decreasing mutant', async () => {
    expect(
      mutantLogic.isMutant(['GATG', 'AGAA', 'TGGC', 'GTCG'])
    ).to.equal(true)
  })

  it('Validate 4x4 human', async () => {
    expect(
      mutantLogic.isMutant(['GATA', 'GATA', 'TTAC', 'GTCG'])
    ).to.equal(false)
  })

  it('Validate 1000x1000 horizontal mutant', async () => {
    const dna = buildTestHumanDna(1000)
    dna[500] = dna[500].replace('GATC', 'AAAA')
    expect(
      mutantLogic.isMutant(dna)
    ).to.equal(true)
  })

  it('Validate 1000x1000 vertical mutant', async () => {
    const dna = buildTestHumanDna(1000)
    dna[600] = dna[599]
    dna[602] = dna[599]
    expect(
      mutantLogic.isMutant(dna)
    ).to.equal(true)
  })

  it('Validate 1000x1000 human', async () => {
    expect(
      mutantLogic.isMutant(buildTestHumanDna(1000))
    ).to.equal(false)
  })
})
