"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FilterButton } from "@/components/Dashboard/DashboardListHeader/FilterButton";
import { useDashboardFilter } from "@/components/Dashboard/DashboardListHeader/FilterHooks";
import { DashboardNotificationsFilter } from "@/components/Filters/DashboardNotificationsFilter";
import { useNotificationsContext } from "@/providers/DashboardNotificationsContextProvider";
import { DashboardNotificationsFilterSchema } from "@/utils/schemas";
import { DashboardNotificationsFilterReq } from "@/utils/types";

const defaultFilter: DashboardNotificationsFilterReq = {
    StartDate: "",
    EndDate: "",
    IsShown: "",
};

/** Filter button to be used in the my notifications screen within dashboard */
export const DashboardNotificationsFilterButton = () => {
    const { hasSearchParams, searchParamsObj, isLoading, newSearchQuery, setNewSearchQuery } = useNotificationsContext();

    const form = useForm<DashboardNotificationsFilterReq>({
        resolver: zodResolver(DashboardNotificationsFilterSchema),
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
            <DashboardNotificationsFilter
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
