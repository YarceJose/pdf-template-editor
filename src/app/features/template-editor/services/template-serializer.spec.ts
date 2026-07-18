import { TestBed } from '@angular/core/testing';

import { TemplateSerializer } from './template-serializer';

describe('TemplateSerializer', () => {
  let service: TemplateSerializer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateSerializer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
