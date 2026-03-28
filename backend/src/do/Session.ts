import { DurableObject} from 'cloudflare:workers'

type Env = {
    SESSION: DurableObjectNamespace
}

export class Session extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {

    super(ctx, env)

    }

async sayHello(): Promise <string> {

    let result = this.ctx.storage.sql
        .exec('SELECT "Hello, World, from DO!" AS message')
        .one();


    return result.message as string;
}
}