import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  MultiColumnList,
} from '@folio/stripes/components';

import CoverageStatements from '../../../CoverageStatements';
import EResourceLink from '../../../EResourceLink';

class PackageResources extends React.Component {
  static manifest = Object.freeze({
    packageContentItems: {
      type: 'okapi',
      path: 'erm/resource',
      records: 'results',
      limitParam: 'perPage',
      perRequest: 100,
      recordsRequired: '1000',
      params: {
        filters: 'pkg.id==:{id}',
        sort: 'pti.titleInstance.name;asc',
        stats: 'true',
      },
    },
  });

  static propTypes = {
    id: PropTypes.string,
    match: PropTypes.object, // eslint-disable-line
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    resources: PropTypes.shape({
      packageContentItems: PropTypes.object,
    }),
  };

  render() {
    const resources = get(this.props.resources, ['packageContentItems', 'records'], []);

    return (
      <Accordion
        id={this.props.id}
        label="E-resources in package"
        open={this.props.open}
        onToggle={this.props.onToggle}
      >
        <MultiColumnList
          contentData={resources}
          interactive={false}
          columnMapping={{
            name: <FormattedMessage id="ui-agreements.eresources.name" />,
            platform: <FormattedMessage id="ui-agreements.eresources.platform" />,
            coverage: <FormattedMessage id="ui-agreements.eresources.coverage" />,
          }}
          columnWidths={{
            coverage: 300,
          }}
          formatter={{
            name: pci => {
              return <EResourceLink eresource={pci._object.pti.titleInstance} />;
            },
            platform: pci => get(pci._object, ['pti', 'platform', 'name'], ''),
            coverage: pci => <CoverageStatements statements={pci._object.coverageStatements} />,
          }}
          visibleColumns={['name', 'platform', 'coverage']}
        />
      </Accordion>
    );
  }
}

export default PackageResources;
