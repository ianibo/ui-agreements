import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Accordion, Layout } from '@folio/stripes/components';
import { DocumentCard } from '@folio/stripes-erm-components';

export default class ExternalLicenses extends React.Component {
  static propTypes = {
    agreement: PropTypes.shape({
      externalLicenseDocs: PropTypes.arrayOf(
        PropTypes.shape({
          dateCreated: PropTypes.string,
          lastUpdated: PropTypes.string,
          location: PropTypes.string,
          name: PropTypes.string.isRequired,
          note: PropTypes.string,
          url: PropTypes.string,
        }),
      ),
    }),
  };

  renderExternalLicenses = (licenses) => (
    licenses.map(license => <DocumentCard key={license.id} {...license} />)
  )

  render() {
    const externalLicenseDocs = get(this.props, ['agreement', 'externalLicenseDocs'], []);

    return (
      <Accordion
        id="agreement-external-licenses"
        label={<FormattedMessage id="ui-agreements.license.externalLicenses" />}
      >
        <Layout className="margin-start-gutter padding-bottom-gutter">
          { externalLicenseDocs.length ?
            this.renderExternalLicenses(externalLicenseDocs) :
            <FormattedMessage id="ui-agreements.license.noExternalLicenses" />
          }
        </Layout>
      </Accordion>
    );
  }
}
