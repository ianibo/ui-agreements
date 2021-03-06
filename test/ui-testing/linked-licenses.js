/* global describe, it, before, after, Nightmare */
const AgreementCRUD = require('./agreement-crud');

module.exports.test = (uiTestCtx) => {
  const number = Math.round(Math.random() * 100000);
  const licenses = [{
    name: `Controlling License #${number}`,
    note: `This controlling license was automatically created and linked for run ${number}`,
    status: 'Controlling',
    startDate: '2018-07-01',
  }, {
    name: `Future License #${number}`,
    note: `This future license was automatically created and linked for run ${number}`,
    status: 'Future',
    startDate: '2028-07-01',
  }, {
    name: `Historical License #${number}`,
    note: `This historical license was automatically created and linked for run ${number}`,
    status: 'Historical',
    startDate: '2008-07-01',
  }];

  const agreement = {
    name: `Linked License Agreement #${number}`,
  };

  describe('ui-agreements: linked licenses', function test() {
    const { config, helpers: { login, logout } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('login > create agreement > link licenses > logout', () => {
      before((done) => {
        login(nightmare, config, done);
      });

      after((done) => {
        logout(nightmare, config, done);
      });

      it('should open Licenses module', done => {
        nightmare
          .wait('#app-list-item-clickable-licenses-module')
          .click('#app-list-item-clickable-licenses-module')
          .wait('#licenses-module-display')
          .then(done)
          .catch(done);
      });

      licenses.forEach(l => {
        it(`should create new license: ${l.name}`, done => {
          nightmare
            .wait('#clickable-newlicense')
            .click('#clickable-newlicense')

            .waitUntilNetworkIdle(2000) // Wait for the default values to be fetched and set.

            .insert('#edit-license-name', l.name)
            .insert('#edit-license-start-date', l.startDate)

            .click('#clickable-createlicense')
            .wait('#licenseInfo')
            .waitUntilNetworkIdle(500)
            .then(() => nightmare.click('#pane-view-license button[icon=times]'))
            .then(done)
            .catch(done);
        });
      });

      it(`should create agreement: ${agreement.name}`, done => {
        AgreementCRUD.createAgreement(nightmare, done, agreement);
      });

      it('should open edit agreement page and open licenses accordion', done => {
        nightmare
          .click('[class*=paneHeader] [class*=dropdown] button')
          .wait('#clickable-edit-agreement')
          .click('#clickable-edit-agreement')
          .wait('#agreementFormInfo')
          .click('#accordion-toggle-button-agreementFormLicense')
          .then(done)
          .catch(done);
      });

      licenses.forEach((l, i) => {
        it(`should link license: ${l.name}`, done => {
          nightmare
            .click('#add-license-btn')
            .wait(`#linkedLicenses-remoteId-${i}-find-license-btn`)
            .click(`#linkedLicenses-remoteId-${i}-find-license-btn`)
            .wait('#plugin-find-license-modal')
            .waitUntilNetworkIdle(1000)
            .wait('#plugin-find-license-modal #input-license-search')
            .insert('#plugin-find-license-modal #input-license-search', l.name)
            .wait('#plugin-find-license-modal #pane-filter button[type="submit"]')
            .click('#plugin-find-license-modal #pane-filter button[type="submit"]')
            .wait('#list-plugin-find-license[data-total-count="1"]')
            .wait(`#plugin-find-license-modal [role="row"] a[data-label*="${l.name}"]`)
            .click(`#plugin-find-license-modal [role="row"] a[data-label*="${l.name}"]`)
            .wait(`#linkedLicenses-remoteId-${i}-license-card`)
            .insert(`#linkedLicenses-note-${i}`, l.note)
            .then(done)
            .catch(done);
        });
      });

      it('should fail to save due to license link status being unselected', done => {
        nightmare
          .click('#clickable-updateagreement')
          .evaluate(() => {
            if (!document.querySelector('label[for*="linkedLicenses-status-"] ~ div[role="alert"] [class*="feedbackError"]')) {
              throw Error('Expected to find a license link status error messages because it is undefined and did not');
            }
          })
          .then(done)
          .catch(done);
      });

      it('should set license link statuses', done => {
        licenses.reduce((nightmare2, l, i) => (
          nightmare2.type(`#linkedLicenses-status-${i}`, l.status)
        ), nightmare)
          .evaluate(() => {
            const error = document.querySelector('label[for*="linkedLicenses-status-"] ~ div[role="alert"] [class*="feedbackError"]');
            if (error) {
              throw Error(`Found license link status error message: ${error}`);
            }
          })
          .then(done)
          .catch(done);
      });

      it('should fail to save due to multiple controlling licenses', done => {
        licenses.reduce((nightmare2, l, i) => (
          nightmare2.type(`#linkedLicenses-status-${i}`, 'Controlling')
        ), nightmare)
          .evaluate(() => {
            if (!document.querySelector('label[for*="linkedLicenses-status-"] ~ div[role="alert"] [class*="feedbackError"]')) {
              throw Error('Expected to find a license link status error message because of multiple controlling licenses and did not');
            }
          })
          .then(done)
          .catch(done);
      });

      it('should set license link statuses', done => {
        licenses.reduce((nightmare2, l, i) => (
          nightmare2.type(`#linkedLicenses-status-${i}`, l.status)
        ), nightmare)
          .evaluate(() => {
            const error = document.querySelector('label[for*="linkedLicenses-status-"] ~ div[role="alert"] [class*="feedbackError"]');
            if (error) {
              throw Error(`Found license link status error message: ${error}`);
            }
          })
          .then(done)
          .catch(done);
      });

      it('should save updated agreement', done => {
        nightmare
          .click('#clickable-updateagreement')
          .wait('#agreementInfo')
          .waitUntilNetworkIdle(2000)
          .wait('#accordion-toggle-button-licenseInfo')
          .click('#accordion-toggle-button-licenseInfo')
          .then(done)
          .catch(done);
      });

      const controllingLicense = licenses.find(l => l.status === 'Controlling');
      if (controllingLicense) {
        it('should find controlling license', done => {
          nightmare
            .wait('#agreement-controlling-license')
            .evaluate(expected => {
              const controllingLicenseElement = document.querySelector('#agreement-controlling-license');
              if (!controllingLicenseElement) throw Error('Failed to find controlling license element');

              const name = controllingLicenseElement.querySelector('[data-test-license-card-name]').innerText;
              if (name !== expected.name) throw Error(`Expected controlling license name "${expected.name}" and found "${name}".`);
            }, controllingLicense)
            .then(done)
            .catch(done);
        });
      }

      const inactiveLicenses = licenses.filter(l => l.status !== 'Controlling');
      if (inactiveLicenses) {
        it('should find inactive licenses', done => {
          nightmare
            .wait('#agreement-inactive-licenses')
            .evaluate(expected => {
              expected.forEach(l => {
                const name = document.evaluate(
                  `//*[@id="agreement-inactive-licenses"]//div[.="${l.name}"]`,
                  document,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE
                ).singleNodeValue;

                if (!name) throw Error(`Expected inactive license node for name ${l.name}`);

                const status = document.evaluate(
                  `//*[@id="agreement-inactive-licenses"]//div[.="${l.status}"]`,
                  document,
                  null,
                  XPathResult.FIRST_ORDERED_NODE_TYPE
                ).singleNodeValue;

                if (!status) throw Error(`Expected inactive license node for status ${l.status}`);
              });
            }, inactiveLicenses)
            .then(done)
            .catch(done);
        });
      }
    });
  });
};
