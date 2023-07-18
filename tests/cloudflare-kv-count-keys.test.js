import 'dotenv/config';
import {listKeys} from '~/api/cloudflare-kv.js';

test('main', async () => {
    const limit = 1000;
    let cursor;
    let count = 0;

    do {
        const {resultInfo} = await listKeys({cursor, limit});
        console.log(resultInfo);
        cursor = resultInfo.cursor;
        count += resultInfo.count;
        // if (resultInfo.count < limit) {
        //     break;
        // }
    } while (cursor);
    console.log('Total keys:', count);
}, 1000 * 60 * 3);

