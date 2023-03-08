const fs = require('fs')
const path = require('path')
const { Alchemy, Network } = require('alchemy-sdk')
const { DateTime } = require('luxon')
const { ethers, BigNumber, utils } = require('ethers')
require('dotenv').config()

const alchemyApiKey = process.env.ALCHEMY_API_KEY
const ethereumRpc = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth'

if (!ethereumRpc) {
  throw new Error('Missing ETHEREUM_RPC environment variable')
}

if (!alchemyApiKey) {
  throw new Error('Missing ALCHEMY_API_KEY environment variable')
}

const settings = {
  apiKey: alchemyApiKey,
  network: Network.ETH_MAINNET
}

const alchemy = new Alchemy(settings)

async function main () {
  const inputFileName = process.argv[2] || 'addresses.txt'
  const inputFilePath = path.join(__dirname, inputFileName)
  const inputFileData = fs.readFileSync(inputFilePath, 'utf8')
  const addresses = inputFileData.split('\n').map((address) => address.trim()).filter((address) => address.length > 0)

  const result = {}
  for (let address of addresses) {
    let filterName = ''
    if (address.endsWith('.eth')) {
      const name = address
      filterName = name
      const provider = new ethers.providers.StaticJsonRpcProvider(ethereumRpc)

      const ensAddr = '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85'
      const ensAbi = ['function ownerOf(uint256) view returns (address)']
      const contract = new ethers.Contract(ensAddr, ensAbi, provider)
      const labelHash = utils.keccak256(utils.toUtf8Bytes(name.replace('.eth', '')))
      const tokenId = BigNumber.from(labelHash).toString()
      address = await contract.ownerOf(tokenId) // registrant address?

      // const ensAddr = (await provider.getNetwork()).ensAddress
      // const ensAbi = [ "function owner(bytes32) view returns (address)" ]
      // const contract = new ethers.Contract(ensAddr, ensAbi, provider)
      // address = await contract.owner(ethers.utils.namehash(name)) // controller address?
    }

    const nftsForOwner = await alchemy.nft.getNftsForOwner(address)
    for (const nft of nftsForOwner.ownedNfts) {
      if (nft.title.includes('eth')) {
        const name = nft.title
        if (filterName && filterName !== name) {
          continue
        }
        const attrs = nft && nft.rawMetadata && nft.rawMetadata.attributes && nft.rawMetadata.attributes.find(attr => attr.trait_type === 'Expiration Date')
        if (!attrs) {
          continue
        }
        const expiresMs = Number(attrs.value)
        if (!expiresMs) {
          continue
        }
        const expiresAt = DateTime.fromMillis(expiresMs).toISO()
        result[name] = {
          name,
          expiresMs,
          expiresAt,
          account: address
        }
      }
    }
  }

  const sorted = Object.values(result).sort((a, b) => a.expiresMs - b.expiresMs)

  const now = Date.now()
  for (const item of sorted) {
    const expired = item.expiresMs < now
    console.log(`${item.name} ${expired ? 'EXPIRED' : ''} ${item.expiresAt} ${item.account}`)
  }
}

main().catch(console.error)
