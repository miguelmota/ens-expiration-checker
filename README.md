# ENS Expiration Checker

> Check [ENS](https://ens.domains/) name expiration dates

## Usage

Clone repo:

```sh
git clone https://github.com/miguelmota/ens-expiration-checker.git
cd ens-expiration-checker
```

Install dependencies:

```sh
npm install
```

This script requires an [Alchemy](https://www.alchemy.com/) API key to fetch NFT information.

Create `.env`

```sh
ALCHEMY_API_KEY=<your_api_key_here>
```

Add your addresses and/or ENS names to a file:

```sh
cat addresses.txt

0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C
uniswap.eth
...
```

Run the script:

```sh
node index.js addresses.txt
```

Example output

```sh
mochi.eth  2027-12-31T13:44:24.000-08:00 0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C
ethers.eth  2027-12-31T13:44:24.000-08:00 0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C
ricmoo.eth  2027-12-31T13:44:24.000-08:00 0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C
mochis.eth  2027-12-31T13:44:24.000-08:00 0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C
uniswap.eth  2035-05-04T08:18:00.000-07:00 0x1a9C8182C09F50C8318d769245beA52c32BE35BC
...
```

## License

[MIT](LICENSE)
