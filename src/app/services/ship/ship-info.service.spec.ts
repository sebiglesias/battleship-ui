import { TestBed, inject } from '@angular/core/testing';

import { ShipInfoService } from './ship-info.service';

describe('ShipInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShipInfoService]
    });
  });

  it('should be created', inject([ShipInfoService], (service: ShipInfoService) => {
    expect(service).toBeTruthy();
  }));
});
