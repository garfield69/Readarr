import { createSelector } from 'reselect';
import connectSection from 'Store/connectSection';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import ArtistIndexBanners from './ArtistIndexBanners';

function createMapStateToProps() {
  return createSelector(
    (state) => state.artistIndex.bannerOptions,
    createClientSideCollectionSelector(),
    createUISettingsSelector(),
    createDimensionsSelector(),
    (bannerOptions, series, uiSettings, dimensions) => {
      return {
        bannerOptions,
        showRelativeDates: uiSettings.showRelativeDates,
        shortDateFormat: uiSettings.shortDateFormat,
        timeFormat: uiSettings.timeFormat,
        isSmallScreen: dimensions.isSmallScreen,
        ...series
      };
    }
  );
}

export default connectSection(
                createMapStateToProps,
                undefined,
                undefined,
                { withRef: true },
                { section: 'series', uiSection: 'artistIndex' }
              )(ArtistIndexBanners);
