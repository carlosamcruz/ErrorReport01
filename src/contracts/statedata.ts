
import {
    method,
    prop,
    SmartContract,
    hash256,
    assert,
    ByteString,
    SigHash, PubKey, FixedArray, fill, Sig, hash160, toByteString, Utils, sha256
} from 'scrypt-ts'

export class StateData extends SmartContract {
    // Stateful property to store counters value.
    @prop()
    alice: PubKey; // alice's public Key
    
    @prop(true)
    data: ByteString; // data.
    
    //constructor(alice: PubKey, data: ByteString) {
    constructor(alice: PubKey) {    
        super(...arguments);
        this.alice = alice;
        //this.data = toByteString('00');
        this.data = toByteString('');
    }

    //  play the game by calling move()
    //  @param n which square to place the symbol
    //  @param sig a player's signature
     
    @method()
    //public move(n: bigint, sig: Sig): void {
    public move(sig: Sig, finish: boolean, newData: ByteString) {    

        // check signature `sig`
        let player: PubKey = this.alice;

        assert(this.checkSig(sig, player), `checkSig failed, pubkey: ${player}`);

        // build the transation outputs
        let outputs = toByteString('');

        if(finish)
        {
            outputs = Utils.buildPublicKeyHashOutput(hash160(player), this.ctx.utxo.value);
        }
        else
        {
            this.data = newData;
            outputs = this.buildStateOutput(this.ctx.utxo.value);    
        }
        if(this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }

        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

}
