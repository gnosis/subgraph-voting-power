# GNO Voting Power

This repo is a collection of subgraphs which aggregate the balance of GNO held in multiple contracts across different networks.

Currently, it tracks GNO balances in:

- Ethereum Mainnet:
  - [x] GNO
  - [x] LGNO
- Gnosis Chain:
  - [x] GNO
  - [x] sGNO
  - [x] LGNO
  - [x] Deposit GNO (voting power is accounted to the withdrawal address)

These subgraphs allow the calculation of voting power associated with these balances for various dApps and protocols.

## Prerequisites
Before you start, make sure you have the following tools installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [Yarn](https://yarnpkg.com/)
- [Graph CLI](https://github.com/graphprotocol/graph-cli)

## Installation

1. Clone this repository:
```
git clone https://github.com/username/subgraph-voting-power.git
```

2. Install the dependencies with Yarn:
```
yarn install
```

## Available Scripts
clean
Removes generated directories (to clean up before rebuilding):
```
yarn clean
```

codegen
Generates TypeScript code from the GraphQL schema and entities for both networks:
```
yarn codegen
```

build
Builds the subgraph for Ethereum:
```
yarn build
```

build:gc
Builds the subgraph for Gnosis Chain:
```
yarn build:gc
```

doall
Executes the full sequence: clean, code generation, and build for both Ethereum and Gnosis Chain:
```
yarn doall
```

deploy
Deploys the subgraph for Ethereum to The Graph Studio:
```
yarn deploy
```

deploy:gc
Deploys the subgraph for Gnosis Chain to The Graph Studio:
```
yarn deploy:gc
```

test
Runs tests to verify the functionality of the subgraph:
```
yarn test
```

## Running Tests
This project uses matchstick-as for testing subgraphs written in AssemblyScript.

Run the tests with the command:

```
yarn test
```

The tests will use the generated files and simulate events to verify that the mappings and entities in the subgraph function as expected.

## Deploying the Subgraph
### On Ethereum Mainnet
To deploy the subgraph to the Ethereum Mainnet, first make sure you are connected to The Graph Studio. Then, use the following command to deploy:

```
yarn deploy
```

### On Gnosis Chain
To deploy the subgraph to Gnosis Chain, use the following command:

```
yarn deploy:gc
```

## Contributing
Contributions are welcome! If you find a bug or have improvement ideas, feel free to open an issue or submit a pull request.

## License
This project is licensed as UNLICENSED.
