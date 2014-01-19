from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^snake/$', 'example.views.main_snake_view', name='main'),
    url(r'^random/snake/$', 'example.views.random_snake_view', name='random'),
    url(r'^random/tank/$', 'example.views.random_tank_view', name='random'),
)
