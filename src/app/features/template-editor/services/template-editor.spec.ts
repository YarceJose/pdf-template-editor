import { TestBed } from '@angular/core/testing';

import { TemplateEditor } from './template-editor';

describe('TemplateEditor', () => {
  let service: TemplateEditor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateEditor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
