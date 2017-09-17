import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hasDifferentItems from 'Utilities/Object/hasDifferentItems';
import { align, icons, sortDirections } from 'Helpers/Props';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBodyConnector from 'Components/Page/PageContentBodyConnector';
import PageJumpBar from 'Components/Page/PageJumpBar';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import NoArtist from 'Artist/NoArtist';
import ArtistIndexTableConnector from './Table/ArtistIndexTableConnector';
import ArtistIndexPosterOptionsModal from './Posters/Options/ArtistIndexPosterOptionsModal';
import ArtistIndexPostersConnector from './Posters/ArtistIndexPostersConnector';
import ArtistIndexBannerOptionsModal from './Banners/Options/ArtistIndexBannerOptionsModal';
import ArtistIndexBannersConnector from './Banners/ArtistIndexBannersConnector';
import ArtistIndexFooter from './ArtistIndexFooter';
import ArtistIndexFilterMenu from './Menus/ArtistIndexFilterMenu';
import ArtistIndexSortMenu from './Menus/ArtistIndexSortMenu';
import ArtistIndexViewMenu from './Menus/ArtistIndexViewMenu';
import styles from './ArtistIndex.css';

function getViewComponent(view) {
  if (view === 'posters') {
    return ArtistIndexPostersConnector;
  }

  if (view === 'banners') {
    return ArtistIndexBannersConnector;
  }

  return ArtistIndexTableConnector;
}

class ArtistIndex extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._viewComponent = null;

    this.state = {
      contentBody: null,
      jumpBarItems: [],
      isPosterOptionsModalOpen: false,
      isBannerOptionsModalOpen: false,
      isRendered: false
    };
  }

  componentDidMount() {
    this.setJumpBarItems();
  }

  componentDidUpdate(prevProps) {
    const {
      items,
      sortKey,
      sortDirection
    } = this.props;

    if (
      hasDifferentItems(prevProps.items, items) ||
      sortKey !== prevProps.sortKey ||
      sortDirection !== prevProps.sortDirection
    ) {
      this.setJumpBarItems();
    }
  }

  //
  // Control

  setContentBodyRef = (ref) => {
    this.setState({ contentBody: ref });
  }

  setViewComponentRef = (ref) => {
    this._viewComponent = ref;
  }

  setJumpBarItems() {
    const {
      items,
      sortKey,
      sortDirection
    } = this.props;

    // Reset if not sorting by sortName
    if (sortKey !== 'sortName') {
      this.setState({ jumpBarItems: [] });
      return;
    }

    const characters = _.reduce(items, (acc, item) => {
      const firstCharacter = item.sortName.charAt(0);

      if (isNaN(firstCharacter)) {
        acc.push(firstCharacter);
      } else {
        acc.push('#');
      }

      return acc;
    }, []).sort();

    // Reverse if sorting descending
    if (sortDirection === sortDirections.DESCENDING) {
      characters.reverse();
    }

    this.setState({ jumpBarItems: _.sortedUniq(characters) });
  }

  //
  // Listeners

  onPosterOptionsPress = () => {
    this.setState({ isPosterOptionsModalOpen: true });
  }

  onPosterOptionsModalClose = () => {
    this.setState({ isPosterOptionsModalOpen: false });
  }

  onBannerOptionsPress = () => {
    this.setState({ isBannerOptionsModalOpen: true });
  }

  onBannerOptionsModalClose = () => {
    this.setState({ isBannerOptionsModalOpen: false });
  }

  onJumpBarItemPress = (item) => {
    const viewComponent = this._viewComponent.getWrappedInstance();
    viewComponent.scrollToFirstCharacter(item);
  }

  onRender = () => {
    this.setState({ isRendered: true }, () => {
      const {
        scrollTop,
        isSmallScreen
      } = this.props;

      if (isSmallScreen) {
        // Seems to result in the view being off by 125px (distance to the top of the page)
        // document.documentElement.scrollTop = document.body.scrollTop = scrollTop;

        // This works, but then jumps another 1px after scrolling
        document.documentElement.scrollTop = scrollTop;
      }
    });
  }

  onScroll = ({ scrollTop }) => {
    this.props.onScroll({ scrollTop });
  }

  //
  // Render

  render() {
    const {
      isFetching,
      isPopulated,
      error,
      items,
      filterKey,
      filterValue,
      sortKey,
      sortDirection,
      view,
      isRefreshingArtist,
      isRssSyncExecuting,
      scrollTop,
      onSortSelect,
      onFilterSelect,
      onViewSelect,
      onRefreshArtistPress,
      onRssSyncPress,
      ...otherProps
    } = this.props;

    const {
      contentBody,
      jumpBarItems,
      isPosterOptionsModalOpen,
      isBannerOptionsModalOpen,
      isRendered
    } = this.state;

    const ViewComponent = getViewComponent(view);
    const isLoaded = !error && isPopulated && !!items.length && contentBody;

    return (
      <PageContent>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label="Update all"
              iconName={icons.REFRESH}
              spinningName={icons.REFRESH}
              isSpinning={isRefreshingArtist}
              onPress={onRefreshArtistPress}
            />

            <PageToolbarButton
              label="RSS Sync"
              iconName={icons.RSS}
              isSpinning={isRssSyncExecuting}
              onPress={onRssSyncPress}
            />

          </PageToolbarSection>

          <PageToolbarSection
            alignContent={align.RIGHT}
            collapseButtons={false}
          >

            {
              view === 'posters' &&
                <PageToolbarButton
                  label="Options"
                  iconName={icons.POSTER}
                  onPress={this.onPosterOptionsPress}
                />
            }

            {
              view === 'posters' &&
                <PageToolbarSeparator />
            }

            {
              view === 'banners' &&
                <PageToolbarButton
                  label="Options"
                  iconName={icons.POSTER}
                  onPress={this.onBannerOptionsPress}
                />
            }

            {
              view === 'banners' &&
                <PageToolbarSeparator />
            }

            <ArtistIndexViewMenu
              view={view}
              onViewSelect={onViewSelect}
            />

            <ArtistIndexSortMenu
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortSelect={onSortSelect}
            />

            <ArtistIndexFilterMenu
              filterKey={filterKey}
              filterValue={filterValue}
              onFilterSelect={onFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        <div className={styles.pageContentBodyWrapper}>
          <PageContentBodyConnector
            ref={this.setContentBodyRef}
            className={styles.contentBody}
            innerClassName={styles[`${view}InnerContentBody`]}
            scrollTop={isRendered ? scrollTop : 0}
            onScroll={this.onScroll}
          >
            {
              isFetching && !isPopulated &&
                <LoadingIndicator />
            }

            {
              !isFetching && !!error &&
                <div>Unable to load artist</div>
            }

            {
              isLoaded &&
                <div className={styles.contentBodyContainer}>
                  <ViewComponent
                    ref={this.setViewComponentRef}
                    contentBody={contentBody}
                    scrollTop={scrollTop}
                    onRender={this.onRender}
                    {...otherProps}
                  />

                  <ArtistIndexFooter
                    series={items}
                  />
                </div>
            }

            {
              !error && isPopulated && !items.length &&
                <NoArtist />
            }
          </PageContentBodyConnector>

          {
            isLoaded && !!jumpBarItems.length &&
              <PageJumpBar
                items={jumpBarItems}
                onItemPress={this.onJumpBarItemPress}
              />
          }
        </div>

        <ArtistIndexPosterOptionsModal
          isOpen={isPosterOptionsModalOpen}
          onModalClose={this.onPosterOptionsModalClose}
        />

        <ArtistIndexBannerOptionsModal
          isOpen={isBannerOptionsModalOpen}
          onModalClose={this.onBannerOptionsModalClose}
        />
      </PageContent>
    );
  }
}

ArtistIndex.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  filterKey: PropTypes.string,
  filterValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
  sortKey: PropTypes.string,
  sortDirection: PropTypes.oneOf(sortDirections.all),
  view: PropTypes.string.isRequired,
  isRefreshingArtist: PropTypes.bool.isRequired,
  isRssSyncExecuting: PropTypes.bool.isRequired,
  scrollTop: PropTypes.number.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  onSortSelect: PropTypes.func.isRequired,
  onFilterSelect: PropTypes.func.isRequired,
  onViewSelect: PropTypes.func.isRequired,
  onRefreshArtistPress: PropTypes.func.isRequired,
  onRssSyncPress: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired
};

export default ArtistIndex;
