import { TestBed } from '@angular/core/testing';

import { TemplateStateService } from './template-state';

describe('TemplateStateService', () => {
  let service: TemplateStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
