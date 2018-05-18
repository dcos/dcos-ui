import Container, { observe } from "../Container";

describe("Container", () => {
  describe("bind", () => {
    it("emits BOUND event with the service identifier", done => {
      const container = new Container();
      container.addEventListener(Container.BOUND, serviceIdentifier => {
        expect(serviceIdentifier).toBe("Mock");
        done();
      });

      container.bind("Mock").toConstantValue(1);
    });
  });

  describe("unbind", () => {
    it("emits UNBOUND event with the service identifier", done => {
      const container = new Container();
      container.addEventListener(Container.UNBOUND, serviceIdentifier => {
        expect(serviceIdentifier).toBe("Mock");
        done();
      });

      container.bind("Mock").toConstantValue(1);
      container.unbind("Mock");
    });
  });

  describe("rebind", () => {
    it("emits REBOUND event with the service identifier", done => {
      const container = new Container();
      container.addEventListener(Container.REBOUND, serviceIdentifier => {
        expect(serviceIdentifier).toBe("Mock");
        done();
      });

      container.bind("Mock").toConstantValue(1);
      container.rebind("Mock").toConstantValue(2);
    });
  });
});

describe("observe", () => {
  const TEST_IDENTIFIER = "TEST_IDENTIFIER";

  describe("without serviceIdentifier", () => {
    it("transmits BOUND event", done => {
      const container = new Container();
      observe(container).subscribe(identifier => {
        expect(identifier).toBe(TEST_IDENTIFIER);
        done();
      });

      container.bind(TEST_IDENTIFIER).toConstantValue(1);
    });

    it("transmits UNBOUND event", done => {
      const container = new Container();
      container.bind(TEST_IDENTIFIER).toConstantValue(1);
      observe(container).subscribe(identifier => {
        expect(identifier).toBe(TEST_IDENTIFIER);
        done();
      });

      container.unbind(TEST_IDENTIFIER);
    });

    it("transmits UNBOUND_ALL event", done => {
      const container = new Container();
      container.bind(TEST_IDENTIFIER).toConstantValue(1);
      observe(container).subscribe(identifier => {
        expect(identifier).toBe(undefined);
        done();
      });

      container.unbindAll();
    });

    it("transmits REBOUND event", done => {
      const container = new Container();
      container.bind(TEST_IDENTIFIER).toConstantValue(1);
      observe(container).subscribe(identifier => {
        expect(identifier).toBe(TEST_IDENTIFIER);
        done();
      });
      container.rebind(TEST_IDENTIFIER).toConstantValue(2);
    });
  });

  describe("with serviceIdentifier", () => {
    // I coundn't figure out how to test this chicken/egg problem
    // So we need to test that observable won't emit anything
    // tslint:disable-next-line:no-empty
    describe("when serviceIdentifier doesn't match", () => {});

    describe("when serviceIdentifier matches", () => {
      it("transmits BOUND event", done => {
        const container = new Container();
        observe(container, TEST_IDENTIFIER).subscribe(identifier => {
          expect(identifier).toBe(TEST_IDENTIFIER);
          done();
        });

        container.bind(TEST_IDENTIFIER).toConstantValue(1);
      });

      it("transmits UNBOUND event", done => {
        const container = new Container();
        container.bind(TEST_IDENTIFIER).toConstantValue(1);
        observe(container, TEST_IDENTIFIER).subscribe(identifier => {
          expect(identifier).toBe(TEST_IDENTIFIER);
          done();
        });
        container.unbind(TEST_IDENTIFIER);
      });

      it("transmits UNBOUND_ALL event", done => {
        const container = new Container();
        container.bind(TEST_IDENTIFIER).toConstantValue(1);
        observe(container, TEST_IDENTIFIER).subscribe(identifier => {
          expect(identifier).toBe(undefined);
          done();
        });
        container.unbindAll();
      });

      it("transmits REBOUND event", done => {
        const container = new Container();
        container.bind(TEST_IDENTIFIER).toConstantValue(1);
        observe(container, TEST_IDENTIFIER).subscribe(identifier => {
          expect(identifier).toBe(TEST_IDENTIFIER);
          done();
        });
        container.rebind(TEST_IDENTIFIER).toConstantValue(2);
      });
    });
  });
});
