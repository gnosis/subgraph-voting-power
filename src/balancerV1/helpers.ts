import {
  BigDecimal,
  Address,
  BigInt,
  Bytes,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  Pool,
  User,
  PoolToken,
  PoolShare,
  TokenPrice,
  Transaction,
  Symmetric,
} from "../types/schema";
import { CTokenBytes } from "../types/templates/Pool/CTokenBytes";
import { CToken } from "../types/templates/Pool/CToken";
import { CRPFactory } from "../types/Factory/CRPFactory";
import { ConfigurableRightsPool } from "../types/Factory/ConfigurableRightsPool";

export let ZERO_BD = BigDecimal.fromString("0");

let network = dataSource.network();

let WETH = "";
let USD = "";
let DAI = "";
let WXDAI = "";
let CELO = "";
let CUSD = "";
let CEUR = "";
let WSPOA = "";
let BTC = "";

let CRP_FACTORY = "";

// Config for mainnet
if (network == "homestead") {
  WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  USD = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
  CRP_FACTORY = "0xed52D8E202401645eDAD1c0AA21e872498ce47D0";
}

if (network == "kovan") {
  WETH = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
  USD = "0x2f375e94fc336cdec2dc0ccb5277fe59cbf1cae5";
  DAI = "0x1528f3fcc26d13f7079325fb78d9442607781c8c";
  CRP_FACTORY = "0x9D06ff728Cea5D46A5AD2E3DADA19698c7CC8422";
}

if (network == "rinkeby") {
  WETH = "0xc778417e063141139fce010982780140aa0cd5ab";
  USD = "0x21f3179cadae46509f615428f639e38123a508ac";
  DAI = "0x947b4082324af403047154f9f26f14538d775194";
  CRP_FACTORY = "0xA3F9145CB0B50D907930840BB2dcfF4146df8Ab4";
}

if (network == "poa-sokol") {
  WXDAI = "0x705581f5830Cfd11715020543f5309ADEBdbd074";
  WETH = "0xB7c91068aC96051573465E43603600C0684a7002";
  WSPOA = "0xc655c6D80ac92d75fBF4F40e95280aEb855B1E87";
  CRP_FACTORY = "0x1CcFa6Ac3fEE7F93b22423Db6ee3F21A2AE2ad14";
}

if (network == "xdai") {
  WXDAI = "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d";
  USD = "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83";
  WETH = "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1";
  CRP_FACTORY = "0x28088c64341cbe7bf90b04786cdbfd1f650d34cc";
}

if (network == "celo") {
  CELO = "0x471ece3750da237f93b8e339c536989b8978a438";
  CUSD = "0x765de816845861e75a25fca122bb6898b8b1282a";
  CEUR = "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73";
  BTC = "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b";
  CRP_FACTORY = "0x2aFEBB4bfA0b1aC42333ABCb1C8A1117A947c112";
}

if (network == "celo-alfajores") {
  CELO = "0xf194afdf50b03e69bd7d057c1aa9e10c9954e4c9";
  CUSD = "0x874069fa1eb16d44d622f2e0ca25eea172369bc1";
  CEUR = "0x10c892a6ec43a53e45d0b916b4b7d383b1b78c0f";
  CRP_FACTORY = "0x1A262F4BD2C88064fc0ec0dE1F343f13D517afED";
}

export function hexToDecimal(hexString: string, decimals: i32): BigDecimal {
  let bytes = Bytes.fromHexString(hexString).reverse() as Bytes;
  let bi = BigInt.fromUnsignedBytes(bytes);
  let scale = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return bi.divDecimal(scale);
}

export function bigIntToDecimal(amount: BigInt, decimals: i32): BigDecimal {
  let scale = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return amount.toBigDecimal().div(scale);
}

export function tokenToDecimal(amount: BigDecimal, decimals: i32): BigDecimal {
  let scale = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return amount.div(scale);
}

export function createPoolShareEntity(
  id: string,
  pool: string,
  user: string
): void {
  let poolShare = new PoolShare(id);

  createUserEntity(user);

  poolShare.userAddress = user;
  poolShare.poolId = pool;
  poolShare.balance = ZERO_BD;
  poolShare.save();
}

export function createPoolTokenEntity(
  id: string,
  pool: string,
  address: string
): void {
  let token = CToken.bind(Address.fromString(address));
  let tokenBytes = CTokenBytes.bind(Address.fromString(address));
  let symbol = "";
  let name = "";
  let decimals = 18;

  // COMMENT THE LINES BELOW OUT FOR LOCAL DEV ON KOVAN

  let symbolCall = token.try_symbol();
  let nameCall = token.try_name();
  let decimalCall = token.try_decimals();

  if (symbolCall.reverted) {
    let symbolBytesCall = tokenBytes.try_symbol();
    if (!symbolBytesCall.reverted) {
      symbol = symbolBytesCall.value.toString();
    }
  } else {
    symbol = symbolCall.value;
  }

  if (nameCall.reverted) {
    let nameBytesCall = tokenBytes.try_name();
    if (!nameBytesCall.reverted) {
      name = nameBytesCall.value.toString();
    }
  } else {
    name = nameCall.value;
  }

  if (!decimalCall.reverted) {
    decimals = decimalCall.value;
  }

  // COMMENT THE LINES ABOVE OUT FOR LOCAL DEV ON KOVAN

  // !!! COMMENT THE LINES BELOW OUT FOR NON-LOCAL DEPLOYMENT
  // This code allows Symbols to be added when testing on local Kovan
  /*
    if(address == '0xd0a1e359811322d97991e03f863a0c30c2cf029c')
      symbol = 'WETH';
    else if(address == '0x1528f3fcc26d13f7079325fb78d9442607781c8c')
      symbol = 'DAI'
    else if(address == '0xef13c0c8abcaf5767160018d268f9697ae4f5375')
      symbol = 'MKR'
    else if(address == '0x2f375e94fc336cdec2dc0ccb5277fe59cbf1cae5')
      symbol = 'USDC'
    else if(address == '0x1f1f156e0317167c11aa412e3d1435ea29dc3cce')
      symbol = 'BAT'
    else if(address == '0x86436bce20258a6dcfe48c9512d4d49a30c4d8c4')
      symbol = 'SNX'
    else if(address == '0x8c9e6c40d3402480ace624730524facc5482798c')
      symbol = 'REP'
    */
  // !!! COMMENT THE LINES ABOVE OUT FOR NON-LOCAL DEPLOYMENT

  let poolToken = new PoolToken(id);
  if (poolToken != null) {
    poolToken.poolId = pool;
    poolToken.address = address;
    poolToken.name = name;
    poolToken.symbol = symbol;
    poolToken.decimals = decimals;
    poolToken.balance = ZERO_BD;
    poolToken.denormWeight = ZERO_BD;
    poolToken.save();
  }
}

export function updatePoolLiquidity(id: string): void {
  let pool = Pool.load(id);
  if (pool != null) {
    let tokensList: Array<Bytes> = pool.tokensList;

    if (pool.tokensCount.equals(BigInt.fromI32(0))) {
      pool.liquidity = ZERO_BD;
      pool.save();
      return;
    }

    if (
      !tokensList ||
      pool.tokensCount.lt(BigInt.fromI32(2)) ||
      !pool.publicSwap
    )
      return;

    // Find pool liquidity

    let hasPrice = false;
    let hasUsdPrice = false;
    let poolLiquidity = ZERO_BD;

    let network = dataSource.network();
    if (network == "celo" || network == "celo-alfajores") {
      if (tokensList.includes(Address.fromString(CUSD))) {
        let cusdPoolTokenId = id.concat("-").concat(CUSD);
        let cusdPoolToken = PoolToken.load(cusdPoolTokenId);
        if (cusdPoolToken != null) {
          poolLiquidity = cusdPoolToken.balance
            .div(cusdPoolToken.denormWeight)
            .times(pool.totalWeight);
        }
        hasPrice = true;
        hasUsdPrice = true;
      } else if (tokensList.includes(Address.fromString(CELO))) {
        let celoTokenPrice = TokenPrice.load(CELO);
        if (celoTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(CELO);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = celoTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
          hasPrice = true;
        }
      } else if (tokensList.includes(Address.fromString(CEUR))) {
        let ceurTokenPrice = TokenPrice.load(CEUR);
        if (ceurTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(CEUR);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = ceurTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
          hasPrice = true;
        }
      }
    } else if (network == "xdai") {
      if (tokensList.includes(Address.fromString(USD))) {
        let usdPoolTokenId = id.concat("-").concat(USD);
        let usdPoolToken = PoolToken.load(usdPoolTokenId);
        if (usdPoolToken != null) {
          poolLiquidity = usdPoolToken.balance
            .div(usdPoolToken.denormWeight)
            .times(pool.totalWeight);
        }
        hasPrice = true;
        hasUsdPrice = true;
      } else if (tokensList.includes(Address.fromString(WXDAI))) {
        let wxdaiPoolTokenId = id.concat("-").concat(WXDAI);
        let wxdaiPoolToken = PoolToken.load(wxdaiPoolTokenId);
        if (wxdaiPoolToken != null) {
          poolLiquidity = wxdaiPoolToken.balance
            .div(wxdaiPoolToken.denormWeight)
            .times(pool.totalWeight);
        }
        hasPrice = true;
      } else if (tokensList.includes(Address.fromString(WETH))) {
        let wethTokenPrice = TokenPrice.load(WETH);
        if (wethTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(WETH);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = wethTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
          hasPrice = true;
        }
      }
    } else if (network == "poa-sokol") {
      if (tokensList.includes(Address.fromString(WSPOA))) {
        let wspoaTokenPrice = TokenPrice.load(WSPOA);
        if (wspoaTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(WSPOA);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = wspoaTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
          hasPrice = true;
        }
      } else if (tokensList.includes(Address.fromString(WXDAI))) {
        let wxdaiPoolTokenId = id.concat("-").concat(WXDAI);
        let wxdaiPoolToken = PoolToken.load(wxdaiPoolTokenId);
        if (wxdaiPoolToken != null) {
          poolLiquidity = wxdaiPoolToken.balance
            .div(wxdaiPoolToken.denormWeight)
            .times(pool.totalWeight);
        }
        hasPrice = true;
      } else if (tokensList.includes(Address.fromString(WETH))) {
        let wethTokenPrice = TokenPrice.load(WETH);
        if (wethTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(WETH);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = wethTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
          hasPrice = true;
        }
      }
    } else {
      if (tokensList.includes(Address.fromString(USD))) {
        let usdPoolTokenId = id.concat("-").concat(USD);
        let usdPoolToken = PoolToken.load(usdPoolTokenId);
        if (usdPoolToken != null) {
          poolLiquidity = usdPoolToken.balance
            .div(usdPoolToken.denormWeight)
            .times(pool.totalWeight);
        }
        hasPrice = true;
        hasUsdPrice = true;
      } else if (tokensList.includes(Address.fromString(WETH))) {
        let wethTokenPrice = TokenPrice.load(WETH);
        if (wethTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(WETH);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = wethTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
          hasPrice = true;
        }
      } else if (tokensList.includes(Address.fromString(DAI))) {
        let daiTokenPrice = TokenPrice.load(DAI);
        if (daiTokenPrice !== null) {
          let poolTokenId = id.concat("-").concat(DAI);
          let poolToken = PoolToken.load(poolTokenId);
          if (poolToken != null) {
            poolLiquidity = daiTokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
            hasPrice = true;
          }
        }
      }
    }
    // Create or update token price
    if (hasPrice) {
      for (let i = 0; i < tokensList.length; i++) {
        let tokenPriceId = tokensList[i].toHexString();
        let tokenPrice = TokenPrice.load(tokenPriceId);
        if (tokenPrice == null) {
          tokenPrice = new TokenPrice(tokenPriceId);
          tokenPrice.poolTokenId = "";
          tokenPrice.poolLiquidity = ZERO_BD;
        }

        let poolTokenId = id.concat("-").concat(tokenPriceId);
        let poolToken = PoolToken.load(poolTokenId);
        if (poolToken != null) {
          if (
            pool.active &&
            !pool.crp &&
            pool.tokensCount.notEqual(BigInt.fromI32(0)) &&
            pool.publicSwap &&
            ((tokenPriceId != WETH.toString() &&
              tokenPriceId != DAI.toString()) ||
              (pool.tokensCount.equals(BigInt.fromI32(2)) && hasUsdPrice))
          ) {
            tokenPrice.price = ZERO_BD;

            if (poolToken.balance.gt(ZERO_BD)) {
              tokenPrice.price = poolLiquidity
                .div(pool.totalWeight)
                .times(poolToken.denormWeight)
                .div(poolToken.balance);
            }

            tokenPrice.symbol = poolToken.symbol;
            tokenPrice.name = poolToken.name;
            tokenPrice.decimals = poolToken.decimals;
            tokenPrice.poolLiquidity = poolLiquidity;
            tokenPrice.poolTokenId = poolTokenId;
            tokenPrice.save();
          }
        }
      }
    }

    // Update pool liquidity

    let liquidity = ZERO_BD;
    let denormWeight = ZERO_BD;

    for (let i = 0; i < tokensList.length; i++) {
      let tokenPriceId = tokensList[i].toHexString();
      let tokenPrice = TokenPrice.load(tokenPriceId);
      if (tokenPrice !== null) {
        let poolTokenId = id.concat("-").concat(tokenPriceId);
        let poolToken = PoolToken.load(poolTokenId);
        if (poolToken != null) {
          if (
            tokenPrice.price.gt(ZERO_BD) &&
            poolToken.denormWeight.gt(denormWeight)
          ) {
            denormWeight = poolToken.denormWeight;
            liquidity = tokenPrice.price
              .times(poolToken.balance)
              .div(poolToken.denormWeight)
              .times(pool.totalWeight);
          }
        }
      }
    }

    let factory = Symmetric.load("1");
    if (factory != null) {
      factory.totalLiquidity = factory.totalLiquidity
        .minus(pool.liquidity)
        .plus(liquidity);
      factory.save();
    }
    pool.liquidity = liquidity;
    pool.save();
  }
}

export function decrPoolCount(
  active: boolean,
  finalized: boolean,
  crp: boolean
): void {
  if (active) {
    let factory = Symmetric.load("1");
    if (factory != null) {
      factory.poolCount = factory.poolCount - 1;
      if (finalized)
        factory.finalizedPoolCount = factory.finalizedPoolCount - 1;
      if (crp) factory.crpCount = factory.crpCount - 1;
      factory.save();
    }
  }
}

export function saveTransaction(
  event: ethereum.Event,
  eventName: string
): void {
  let tx = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  let userAddress = event.transaction.from.toHex();
  let transaction = Transaction.load(tx);
  if (transaction == null) {
    transaction = new Transaction(tx);
  }
  transaction.event = eventName;
  transaction.poolAddress = event.address.toHex();
  transaction.userAddress = userAddress;
  // transaction.gasUsed = event.transaction.gasUsed.toBigDecimal()
  transaction.gasPrice = event.transaction.gasPrice.toBigDecimal();
  transaction.tx = event.transaction.hash;
  transaction.timestamp = event.block.timestamp.toI32();
  transaction.block = event.block.number.toI32();
  transaction.save();

  createUserEntity(userAddress);
}

export function createUserEntity(address: string): void {
  if (User.load(address) == null) {
    let user = new User(address);
    user.save();
  }
}

export function isCrp(address: Address): boolean {
  let crpFactory = CRPFactory.bind(Address.fromString(CRP_FACTORY));
  let isCrp = crpFactory.try_isCrp(address);
  if (isCrp.reverted) return false;
  return isCrp.value;
}

export function getCrpUnderlyingPool(
  crp: ConfigurableRightsPool
): string | null {
  let bPool = crp.try_bPool();
  if (bPool.reverted) return null;
  return bPool.value.toHexString();
}

export function getCrpController(crp: ConfigurableRightsPool): string | null {
  let controller = crp.try_getController();
  if (controller.reverted) return null;
  return controller.value.toHexString();
}

export function getCrpSymbol(crp: ConfigurableRightsPool): string {
  let symbol = crp.try_symbol();
  if (symbol.reverted) return "";
  return symbol.value;
}

export function getCrpName(crp: ConfigurableRightsPool): string {
  let name = crp.try_name();
  if (name.reverted) return "";
  return name.value;
}

export function getCrpCap(crp: ConfigurableRightsPool): BigInt {
  let cap = crp.try_getCap();
  if (cap.reverted) return BigInt.fromI32(0);
  return cap.value;
}

export function getCrpRights(crp: ConfigurableRightsPool): string[] {
  let rights = crp.try_rights();
  if (rights.reverted) return [];
  let rightsArr: string[] = [];
  if (rights.value.value0) rightsArr.push("canPauseSwapping");
  if (rights.value.value1) rightsArr.push("canChangeSwapFee");
  if (rights.value.value2) rightsArr.push("canChangeWeights");
  if (rights.value.value3) rightsArr.push("canAddRemoveTokens");
  if (rights.value.value4) rightsArr.push("canWhitelistLPs");
  if (rights.value.value5) rightsArr.push("canChangeCap");
  return rightsArr;
}
