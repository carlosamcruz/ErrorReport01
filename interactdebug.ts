////////////////////////////////////////////////////////////////////////////////
//Jogar Bob e Alice - DEBUG
////////////////////////////////////////////////////////////////////////////////
import { StateData } from './src/contracts/statedata'
import { TestWallet, findSig, bsv, DefaultProvider, hash160, ByteString} from 'scrypt-ts'
import { buildPublicKeyHashScript} from 'scrypt-ts'

(async () => {

    let dataToChain: ByteString = '00'
 
    await StateData.compile()

    const privateKey2 = bsv.PrivateKey.fromHex("ccbf6b06cb35e102f42ecfaa5de55ab6cd35431b95f6ee4fd5199ad90943c5cf", bsv.Networks.testnet)
  
    // Prepare signer.
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
    const Alice = new TestWallet(privateKey2, new DefaultProvider({network: bsv.Networks.testnet}))

    let provDf = new DefaultProvider({network: bsv.Networks.testnet})

    await provDf.connect()
    let tx3 = new bsv.Transaction

    //Place here the TXID of the current state of the contract
    tx3 = await provDf.getTransaction('dac3f5ea62e776f36456e608ca208cd5a130f714a711eeac371ff86a168a40c1');

    let finish = false
    //let newData = '0123456789cd'

    ////////////////////////////////////////////
    // Set of Test Strings
    ////////////////////////////////////////////
 
    //String of 169 bytes - OK
    //let newData = '303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'

    //String of 170 bytes - OK
    //let newData = '30303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'

    //String of 171 bytes - This will produce ERROR: "unexpected response code 500: 64: bad-txns-too-many-sigops"
    //let newData = '3130303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'

    //String of 172 bytes - This will produce ERROR: "unexpected response code 500: 64: bad-txns-too-many-sigops"
    //let newData = 'ab3130303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'
      
    //String of 173 bytes - OK
    let newData = 'cdab3130303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'

    //String of 174 bytes - OK
    //let newData = 'efcdab3130303030303031343b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34333b414d3b0d0a373b31323b315a454e30303130303030303031353b425230303030373b42523030303030313b5a4542504342413030313b537570706c793b363b42434d414f3b4e6f6e653b30322f30322f323032333b31313a34343b414d3b0d0a'


    ////////////////////////////////////////////
    ////////////////////////////////////////////


    
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