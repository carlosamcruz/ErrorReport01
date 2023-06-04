import { Statedata } from '../../src/contracts/statedata'
import { getDefaultSigner } from '../utils/txHelper'
import { MethodCallOptions } from 'scrypt-ts'

async function main() {
    await Statedata.compile()

    // create a genesis instance
    const counter = new Statedata(0n)

    // connect to a signer
    await counter.connect(getDefaultSigner())

    // contract deployment
    const deployTx = await counter.deploy(1)
    console.log('Counter deploy tx:', deployTx.id)

    let prevInstance = counter

    // multiple calls
    for (let i = 0; i < 3; i++) {
        // 1. build a new contract instance
        const newStatedata = prevInstance.next()
        // 2. apply the updates on the new instance.
        newStatedata.count++
        // 3. construct a transaction for contract call
        const { tx: callTx, atInputIndex } =
            await prevInstance.methods.increment({
                next: {
                    instance: newStatedata,
                    balance: 1,
                },
            } as MethodCallOptions<Statedata>)

        console.log(
            'Counter call tx: ',
            callTx.id,
            ', count updated to: ',
            newStatedata.count
        )
        // prepare for the next iteration
        prevInstance = newStatedata
    }
}

describe('Test SmartContract `Counter` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
