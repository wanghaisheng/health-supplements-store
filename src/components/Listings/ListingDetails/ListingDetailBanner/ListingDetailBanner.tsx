import { clsx } from "clsx";
import Link from "next/link";
import { FC } from "react";
import { LinkWithLocale } from "@/components/Common";
import { AlertCircleIcon } from "@/icons";
import { ListingStatusDescriptions } from "@/utils/constants";
import { ListingStatusTypes } from "@/utils/enum";
import { unCamelCase } from "@/utils/helpers";
import { ListingItem } from "@/utils/types";
import { RelistButton } from "./RelistButton";
import { RenewButton } from "./RenewButton";
import { ReviewButton } from "./ReviewButton";

interface Props {
    isAdmin?: boolean;
    listingItem?: ListingItem;
    loading?: boolean;
}

export const ListingDetailBanner: FC<Props> = ({ loading, listingItem = {}, isAdmin }) => {
    const { status: listingStatus, id: listingId, userId, reviewComment } = listingItem as ListingItem;
    return (
        <div
            className={clsx({
                "alert mb-6 shadow-lg mt-4 md:mt-1": true,
                "animate-pulse": loading,
                "alert-error": listingStatus === ListingStatusTypes.Declined,
                "alert-info": listingStatus === ListingStatusTypes.Posted,
                "alert-warning": [ListingStatusTypes.UnderReview, ListingStatusTypes.Expired].includes(listingStatus as ListingStatusTypes),
                "alert-success": listingStatus === ListingStatusTypes.Sold,
            })}
        >
            <AlertCircleIcon />
            <div>
                <h3 className={clsx({ "font-bold": true, "opacity-50": loading })}>{loading ? "Loading..." : unCamelCase(listingStatus)}</h3>
                <div className={clsx({ "text-xs": true, "opacity-50": loading })}>
                    {loading
                        ? "Loading description of the listing status..."
                        : `${ListingStatusDescriptions[listingStatus as ListingStatusTypes]} ${
                              listingStatus === ListingStatusTypes.Declined && reviewComment ? reviewComment : ""
                          }`}
                </div>
            </div>
            {!loading && (
                <>
                    {listingStatus === ListingStatusTypes.Posted && (
                        <LinkWithLocale href={`/search/${listingId}`}>
                            <button className="btn btn-ghost btn-sm">View</button>
                        </LinkWithLocale>
                    )}
                    {userId && isAdmin && listingStatus === ListingStatusTypes.UnderReview && (
                        <ReviewButton listingItem={listingItem as ListingItem} />
                    )}
                    {userId && listingStatus === ListingStatusTypes.Expired && <RenewButton listingItem={listingItem as ListingItem} />}
                    {userId && listingStatus === ListingStatusTypes.TemporarilyUnlisted && <RelistButton listingItem={listingItem as ListingItem} />}
                    {listingStatus === ListingStatusTypes.Declined && (
                        <Link href={`${window?.location?.pathname}/edit/${listingId}`}>
                            <button className="btn btn-ghost btn-sm">Edit</button>
                        </Link>
                    )}
                </>
            )}
        </div>
    );
};
