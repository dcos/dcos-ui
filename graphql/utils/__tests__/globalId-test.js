jest.unmock('../globalId');

import {
  toGlobalId,
  fromGlobalId
} from '../globalId';

describe('toGlobalId()', () => {

  it('returns the correct id format (string)', () => {
    expect(toGlobalId('task', '123')).toEqual('task:123');
  });

  it('throws if id undefined', () => {
    expect(() => {
      toGlobalId('task', undefined);
    }).toThrow('Invalid arguments for toGlobalId [task, undefined]');
  });

  it('throws if id not string (with object)', () => {
    expect(() => {
      toGlobalId('task', {});
    }).toThrow('Invalid arguments for toGlobalId [task, [object Object]]');
  });

});

describe('fromGlobalId()', () => {

  it('returns the correct type and id', () => {
    expect(fromGlobalId('task:123')).toEqual({
      type: 'task',
      id: '123'
    });
  });

  it('throws if invalid globalId', () => {
    expect(() => {
      fromGlobalId('task-123');
    }).toThrow('task-123 is not a valid globalId');
  });

})
