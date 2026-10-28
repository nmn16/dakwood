from django.contrib import admin

from .models import (
    HospitalityBooking, HospitalityProperty, Inquiry, Shipment,
    TourBooking, TourPackage, TrackingEvent,
)

admin.site.site_header = "Kenchain Groups Admin"
admin.site.site_title = "Kenchain Admin"
admin.site.index_title = "Manage services and customer requests"


@admin.register(HospitalityProperty)
class HospitalityPropertyAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "nightly_rate", "rooms_total", "active")
    list_filter = ("active", "location")
    search_fields = ("name", "location", "description")
    list_editable = ("active", "nightly_rate", "rooms_total")


@admin.register(HospitalityBooking)
class HospitalityBookingAdmin(admin.ModelAdmin):
    list_display = ("reference", "full_name", "property", "check_in", "check_out", "guests", "rooms_requested", "status", "created_at")
    list_filter = ("status", "check_in", "property")
    search_fields = ("reference", "full_name", "contact", "email", "property__name")
    list_editable = ("status",)
    readonly_fields = ("reference", "created_at")
    date_hierarchy = "check_in"


@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ("title", "destination", "category", "duration_days", "price_per_person", "max_group_size", "active")
    list_filter = ("category", "active")
    search_fields = ("title", "destination", "description")
    list_editable = ("active", "price_per_person", "max_group_size")


@admin.register(TourBooking)
class TourBookingAdmin(admin.ModelAdmin):
    list_display = ("reference", "full_name", "package", "travel_date", "travelers", "status", "created_at")
    list_filter = ("status", "travel_date", "package")
    search_fields = ("reference", "full_name", "contact", "email", "package__title")
    list_editable = ("status",)
    readonly_fields = ("reference", "created_at")
    date_hierarchy = "travel_date"


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "contact", "service", "handled", "created_at")
    list_filter = ("service", "handled")
    search_fields = ("name", "contact", "message")
    list_editable = ("handled",)
    readonly_fields = ("created_at",)


class TrackingEventInline(admin.TabularInline):
    model = TrackingEvent
    extra = 1
    readonly_fields = ("timestamp",)


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ("tracking_number", "sender_name", "receiver_name", "origin", "destination", "status")
    list_filter = ("status",)
    search_fields = ("tracking_number", "sender_name", "receiver_name")
    readonly_fields = ("tracking_number", "created_at")
    inlines = [TrackingEventInline]
