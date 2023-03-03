const fs = require('fs')
const path = require('path')
const { Alchemy, Network } = require('alchemy-sdk')
const { DateTime } = require('luxon')
require('dotenv').config()

const alchemyApiKey = process.env.ALCHEMY_API_KEY

if (!alchemyApiKey) {
  throw new Error('Missing ALCHEMY_API_KEY environment variable')
}

const settings = {
  apiKey: alchemyApiKey,
  network: Network.ETH_MAINNET
}

const alchemy = new Alchemy(settings)

async function main () {
  const inputFileName = 'addresses.txt'
  const inputFilePath = path.join(__dirname, inputFileName)
  const inputFileData = fs.readFileSync(inputFilePath, 'utf8')
  const addresses = inputFileData.split('\n').map((address) => address.trim()).filter((address) => address.length > 0)

  const result = []
  for (const address of addresses) {
    const nftsForOwner = await alchemy.nft.getNftsForOwner(address)
    for (const nft of nftsForOwner.ownedNfts) {
      if (nft.title.includes('eth')) {
        const name = nft.title
        const expiresMs = Number(nft.rawMetadata.attributes.find(attr => attr.trait_type === 'Expiration Date').value)
        const expiresAt = DateTime.fromMillis(expiresMs).toISO()
        result.push({
          name,
          expiresMs,
          expiresAt,
          account: address
        })
      }
    }
  }

  const sorted = result.sort((a, b) => a.expiresMs - b.expiresMs)

  const now = Date.now()
  for (const item of sorted) {
    const expired = item.expiresMs < now
    console.log(`${item.name} ${expired ? 'EXPIRED' : ''} ${item.expiresAt} ${item.account}`)
  }
}

main().catch(console.error)
