import * as fc from 'fast-check';
import { MArray } from '../src';

describe('mArray', () => {
  it('slice should work with randomly generated splice operations', () => {
    const ARR_MAX_LENGTH = 1000;

    fc.assert(
      fc.property(
        fc.array(fc.integer(), { maxLength: ARR_MAX_LENGTH }),
        fc.array(
          fc.record({
            at: fc.integer(-ARR_MAX_LENGTH * 2, ARR_MAX_LENGTH * 2), // So the prob a case where the index is out of bounds is between 0-50%
            deleteCount: fc.integer(-ARR_MAX_LENGTH * 2, ARR_MAX_LENGTH * 2), // So the prob a case where the count is out of bounds is between 0-50%
            add: fc.array(fc.integer(), { maxLength: ARR_MAX_LENGTH }),
          }),
        ),
        (data, splices) => {
          const mArray = MArray.from(data);

          for (const record of splices) {
            const delsArray = data.splice(record.at, record.deleteCount, ...record.add);
            const delsMArray = mArray.splice(record.at, record.deleteCount, ...record.add);

            expect(delsMArray.toArray()).toEqual(delsArray);
            expect(mArray.toArray()).toEqual(data);
          }
        },
      ),
      {
        numRuns: 50,
      },
    );
  });
});
