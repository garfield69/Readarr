using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MetadataSource.Goodreads;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.ImportLists.Goodreads
{
    public class GoodreadsOwnedBooksImportListSettings : GoodreadsSettingsBase<GoodreadsOwnedBooksImportListSettings>
    {
    }

    public class GoodreadsOwnedBooks : GoodreadsImportListBase<GoodreadsOwnedBooksImportListSettings>
    {
        public GoodreadsOwnedBooks(IImportListStatusService importListStatusService,
                                   IConfigService configService,
                                   IParsingService parsingService,
                                   IHttpClient httpClient,
                                   Logger logger)
        : base(importListStatusService, configService, parsingService, httpClient, logger)
        {
        }

        public override string Name => "Goodreads Owned Books";

        public override IList<ImportListItemInfo> Fetch()
        {
            var reviews = new List<OwnedBookResource>();
            var page = 0;

            while (true)
            {
                var curr = GetOwned(++page);

                if (curr == null || curr.Count == 0)
                {
                    break;
                }

                reviews.AddRange(curr);
            }

            var result = reviews.Select(x => new ImportListItemInfo
            {
                Author = x.Book.Authors.First().Name.CleanSpaces(),
                AuthorGoodreadsId = x.Book.Authors.First().Id.ToString(),
                Book = x.Book.TitleWithoutSeries.CleanSpaces(),
                EditionGoodreadsId = x.Book.Id.ToString()
            }).ToList();

            return CleanupListItems(result);
        }

        private IReadOnlyList<OwnedBookResource> GetOwned(int page)
        {
            try
            {
                var builder = RequestBuilder()
                    .SetSegment("route", $"owned_books/user")
                    .AddQueryParam("id", Settings.UserId)
                    .AddQueryParam("page", page);

                var httpResponse = OAuthGet(builder);

                _logger.Trace("Got:\n{0}", httpResponse.Content);

                return httpResponse.Deserialize<PaginatedList<OwnedBookResource>>("reviews").List;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Error fetching bookshelves from Goodreads");
                return new List<OwnedBookResource>();
            }
        }
    }
}
