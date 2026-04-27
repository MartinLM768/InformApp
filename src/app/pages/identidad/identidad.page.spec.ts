/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdentidadPage } from './identidad.page';

describe('IdentidadPage', () => {
  let component: IdentidadPage;
  let fixture: ComponentFixture<IdentidadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});