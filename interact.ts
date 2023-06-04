////////////////////////////////////////////////////////////////////////////////
//Jogar Bob e Alice - DEBUG
////////////////////////////////////////////////////////////////////////////////
import { StateData } from './src/contracts/statedata'
import { TestWallet, findSig, bsv, DefaultProvider, hash160, ByteString} from 'scrypt-ts'
import { buildPublicKeyHashScript} from 'scrypt-ts'

import * as fs from 'fs';

//Datalog.csv
//const filePath = './file.txt';  
const filePath = './Datalog.csv';

function stringToHex(str: string): string {
    let hexString = '';
    for (let i = 0; i < str.length; i++) {
      const hex = str.charCodeAt(i).toString(16);
      hexString += hex.length === 2 ? hex : '0' + hex;
    }
    return hexString;
  }

(async () => {

    let dataToChain: ByteString = '00'

    
    // Alternatively, you can read the file synchronously
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        dataToChain = stringToHex(data)
        //console.log(data);
        console.log(data.length);
        //console.log(dataToChain);
        console.log(dataToChain.length);
    } catch (err) {
        console.error('Error reading file:', err);
    }
 
    await StateData.compile()

    const privateKey2 = bsv.PrivateKey.fromHex("ccbf6b06cb35e102f42ecfaa5de55ab6cd35431b95f6ee4fd5199ad90943c5cf", bsv.Networks.testnet)
  
    // Prepare signer.
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
    const Alice = new TestWallet(privateKey2, new DefaultProvider({network: bsv.Networks.testnet}))

    let provDf = new DefaultProvider({network: bsv.Networks.testnet})

    await provDf.connect()
    let tx3 = new bsv.Transaction

    tx3 = await provDf.getTransaction('b0b819d3716530728578ddcbde6aa50193029ae455c57c7289068e4ad662391a');

    let finish = false
    //let newData = '0123456789cd'
    
    
    //let newData = dataToChain.substring(0, 20000)
    //let newData = dataToChain.substring(0, dataToChain.length)
    //let newData = dataToChain.substring(0, 20822 - 10) // funcionou
    //let newData = dataToChain.substring(0, 20822 - 4) // funcionou

 //   let newData = dataToChain.substring(0, dataToChain.length - 4) + dataToChain.substring(0, dataToChain.length - 4) // funcionou

    //let newData = dataToChain.substring(0, dataToChain.length - 4)  // funcionou

    let newData = dataToChain.substring(0, dataToChain.length ) + '00' // funcionou
    console.log('Last Char: ', dataToChain.substring(dataToChain.length - 4, dataToChain.length))
    console.log('first Char: ', dataToChain.substring(0, 20))

    newData = 'ab3130303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'






    
    
    
    //let newData = '00000123456789cd'

    console.log('Test TX3: ', tx3.id)

    //Para carregar o SC que será executado
    let instance2 = StateData.fromTx(tx3, 0)


////////////////////////////////////////////////////////////////
// Jogo
////////////////////////////////////////////////////////////////

    let pbkeyAlice = bsv.PublicKey.fromPrivateKey(privateKey2)

    let pvtkey = privateKey2;
    let pbkey = pbkeyAlice;

    //https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#method-with-signatures

    const balance = instance2.balance
    const nextInstance = instance2.next()

    if(!finish)
    {
        nextInstance.data = newData;
    }
    
    await instance2.connect(Alice)

    instance2.bindTxBuilder('move', async function () {

            const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
       
            const unsignedTx: bsv.Transaction = new bsv.Transaction()
            //.addInputFromPrevTx(current.from?.tx as bsv.Transaction, current.from?.outputIndex)
            .addInputFromPrevTx(tx3, 0)
            //.from(options.utxos);

            if (finish) 
            {    
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: buildPublicKeyHashScript(hash160(instance2.alice)),
                    satoshis: balance
                }))
                .change(changeAddress)
            
                return Promise.resolve({
                    tx: unsignedTx,
                    atInputIndex: 0,
                    nexts: [
                    ]
                })
            }
            else
            {
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: balance,
                }))
                .change(changeAddress)
            
                return Promise.resolve({
                    tx: unsignedTx,
                    atInputIndex: 0,
                    nexts: [
                    ]
                });              
            }            
    });
    
    const { tx: callTx } = await instance2.methods.move(

        // the first argument `sig` is replaced by a callback function which will return the needed signature
        (sigResps) => findSig(sigResps, pbkey),
        finish,
        newData
    )

    console.log('TXID New State: ', callTx.id)     
        
})()          