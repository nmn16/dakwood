from django.urls import path
from . import views

urlpatterns = [
    path("hospitality/properties/", views.hospitality_properties, name="hospitality_properties"),
    path("hospitality/bookings/", views.create_hospitality_booking, name="create_hospitality_booking"),
    path("tours/packages/", views.tour_packages, name="tour_packages"),
    path("tours/bookings/", views.create_tour_booking, name="create_tour_booking"),
    path("bookings/<str:reference>/", views.booking_status, name="booking_status"),
    path("inquiries/", views.create_inquiry, name="create_inquiry"),
    path("track/<str:number>/", views.track_shipment, name="track_shipment"),
]
