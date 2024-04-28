"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FilterButton } from "@/components/Dashboard/DashboardListHeader/FilterButton";
import { useDashboardFilter } from "@/components/Dashboard/DashboardListHeader/FilterHooks";
import { DashboardMySubscriptionFilter } from "@/components/Filters/DashboardMySubscriptionFilter";
import { useDashboardMySubscriptionsContext } from "@/providers/DashboardMySubscriptionsContextProvider";
import { DashboardMySubscriptionFilterSchema } from "@/utils/schemas";
import { DashboardMySubscriptionFilterReq } from "@/utils/types";

const defaultFilter: DashboardMySubscriptionFilterReq = {
    Active: "",
    NotificationFrequency: "",
};

/** Filter button to be used in the my subscriptions screen within dashboard */
export const DashboardMySubscriptionFilterButton = () => {
    const { hasSearchParams, searchParamsObj, isLoading, newSearchQuery, setNewSearchQuery } = useDashboardMySubscriptionsContext();

    const form = useForm<DashboardMySubscriptionFilterReq>({
        resolver: zodResolver(DashboardMySubscriptionFilterSchema),
        defaultValues: searchParamsObj,
        mode: "all",
    });

    const { dropdownOpen, setDropdownOpen, handleFilterOpen, onApplyFilterClick, onResetClick } = useDashboardFilter({
        reset: form.reset,
        defaultFilter,
        isLoading,
        newSearchQuery,
        setNewSearchQuery,
        searchParamsObj,
    });

    return (
        <div className="flex flex-col items-end justify-end">
            <FilterButton dropdownOpen={dropdownOpen} handleFilterOpen={handleFilterOpen} hasSearchParams={hasSearchParams} loading={isLoading} />
            <DashboardMySubscriptionFilter
                dropdownOpen={dropdownOpen}
                form={form}
                hasSearchParams={hasSearchParams}
                isLoading={isLoading}
                setDropdownOpen={setDropdownOpen}
                onApplyFilterClick={onApplyFilterClick}
                onResetClick={onResetClick}
            />
        </div>
    );
};
