import { describe, expect, it } from 'vitest';
import { toPageableParams } from './pagination';

describe('toPageableParams', () => {
  it('omits keys entirely when unset, so the backend default (@PageableDefault) applies', () => {
    expect(toPageableParams({})).toEqual({});
  });

  it('passes page and size through unchanged', () => {
    expect(toPageableParams({ page: 2, size: 50 })).toEqual({ page: 2, size: 50 });
  });

  it('combines sort field and direction into "field,direction"', () => {
    expect(toPageableParams({ sort: 'price', sortDirection: 'desc' })).toEqual({
      sort: 'price,desc',
    });
  });

  it('defaults sort direction to asc when a sort field is given without one', () => {
    expect(toPageableParams({ sort: 'name' })).toEqual({ sort: 'name,asc' });
  });
});
