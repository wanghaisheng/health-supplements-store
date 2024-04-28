"use client";

import { Claims } from "@auth0/nextjs-auth0/edge";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { clsx } from "clsx";
import { StringifiableRecord } from "query-string";
import { Dispatch, FC, SetStateAction } from "react";
import { Empty, Pagination } from "@/components/Common";
import { useDashboardAllListingsContext } from "@/providers/DashboardAllListingsContextProvider";
import { useDashboardMyListingsContext } from "@/providers/DashboardMyListingsContextProvider";
import { ListingItems, PaginatedResponse } from "@/utils/types";
import { DashboardListingItem } from "./DashboardListingItem";

interface Props {
    /** Base path to be used when forwarding to a subpath */
    basePath?: string;
    /** Boolean field to change the text to be shown within the empty component */
    hasSearchParams?: boolean;
    /** Paginated list of listings to be shown */
    listings?: PaginatedResponse & ListingItems;
    /** To show placeholder listings during initial render without any data */
    pageLoading?: boolean;
    /** User details to figure enable/disable author and admin functionalities */
    userClaims?: Claims;
}

/** List of listing items to be shown in the dashboard */
export const DashboardListingsList: FC<
    Props & { isLoading: boolean; searchParamsObj: Record<string, string>; setNewSearchQuery: Dispatch<SetStateAction<string>> }
> = ({ userClaims, listings, pageLoading, isLoading, searchParamsObj, setNewSearchQuery, basePath, hasSearchParams }) => {
    const [parent] = useAutoAnimate();

    return (
        <div className={clsx("grid gap-1 xl:gap-2", (pageLoading || isLoading) && "animate-pulse")} ref={parent}>
            {!pageLoading && listings?.totalCount === 0 && (
                <Empty
                    button={
                        hasSearchParams
                            ? { text: "Reset Filters", href: basePath!, onClick: () => setNewSearchQuery("") }
                            : { text: "Create New", href: "/dashboard/new-listing" }
                    }
                    subText={
                        hasSearchParams
                            ? "Try adjusting or resetting your search filters"
                            : "By creating a new new advertisement, you have the opportunity to showcase the vehicle you want to sell to a wide audience."
                    }
                    text="No advertisements to display"
                />
            )}

            {listings?.items?.map((item) => (
                <DashboardListingItem key={item.id} basePath={basePath} isAdmin={userClaims?.isAdmin} listingItem={item} />
            ))}

            {pageLoading && new Array(5).fill("").map((_, i) => <DashboardListingItem key={`loading-listing-item-${i}`} loading />)}

            <Pagination
                basePath={basePath}
                loading={pageLoading || isLoading}
                pageNumber={listings?.pageNumber}
                searchParams={searchParamsObj as StringifiableRecord}
                setNewSearchQuery={setNewSearchQuery}
                totalPages={listings?.totalPages}
            />
        </div>
    );
};

/** DashboardListingsList bound with my listing context */
export const DashboardMyListingsList: FC<Props> = (props) => {
    const { isLoading, searchParamsObj, setNewSearchQuery, hasSearchParams } = useDashboardMyListingsContext();

    return (
        <DashboardListingsList
            hasSearchParams={hasSearchParams}
            isLoading={isLoading}
            searchParamsObj={searchParamsObj}
            setNewSearchQuery={setNewSearchQuery}
            {...props}
        />
    );
};

/** DashboardListingsList bound with all listing context */
export const DashboardAllListingsList: FC<Props> = (props) => {
    const { isLoading, searchParamsObj, setNewSearchQuery, hasSearchParams } = useDashboardAllListingsContext();

    return (
        <DashboardListingsList
            hasSearchParams={hasSearchParams}
            isLoading={isLoading}
            searchParamsObj={searchParamsObj}
            setNewSearchQuery={setNewSearchQuery}
            {...props}
        />
    );
};
