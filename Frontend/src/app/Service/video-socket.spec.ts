import { TestBed } from '@angular/core/testing';

import { VideoSocket } from './video-socket';

describe('VideoSocket', () => {
  let service: VideoSocket;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoSocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
