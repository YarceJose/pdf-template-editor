import { TestBed } from '@angular/core/testing';

import { TemplateSerializerService } from './template-serializer';

describe('TemplateSerializerService', () => {
  let service: TemplateSerializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateSerializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
