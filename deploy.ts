////////////////////////////////////////////////////////////
//Criar o Smart Contract
////////////////////////////////////////////////////////////
//Scrypt crew
import { StateData } from './src/contracts/statedata'
import { getDefaultSigner, sleep } from './tests/utils/txHelper'
import {PubKeyHash, bsv, PubKey, toHex, TestWallet, DefaultProvider, toByteString} from 'scrypt-ts'

(async () => { 

    const privateKey2 = bsv.PrivateKey.fromHex("ccbf6b06cb35e102f42ecfaa5de55ab6cd35431b95f6ee4fd5199ad90943c5cf", bsv.Networks.testnet)
    const privateKey3 = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)
    
    // Prepare signer.
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider

    const Alice = new TestWallet(privateKey2, new DefaultProvider({network: bsv.Networks.testnet}))
    const Bob = new TestWallet(privateKey3, new DefaultProvider({network: bsv.Networks.testnet}))

    console.log(('Teste de Contrato de Dado na Blockchain'))
    console.log(toHex('Teste de Contrato de Dado na Blockchain'))
    await StateData.compile() 
  
    let pbkeyBob = bsv.PublicKey.fromPrivateKey(privateKey3)
    let pbkeyAlice = bsv.PublicKey.fromPrivateKey(privateKey2)

    console.log(toByteString('Teste de Contrato de Dado na Blockchain'))

    const counter = new StateData(PubKey(toHex(pbkeyAlice)))

    await counter.connect(Bob) 
  
    const balance = 1000 
  
    // contract deployment 
    const deployTx = await counter.deploy(balance) 
    console.log('Counter deploy tx:', deployTx.id)
    
} )()