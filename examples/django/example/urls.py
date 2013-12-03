from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^main/$', 'example.views.main_view', name='main'),
    url(r'^random/$', 'example.views.random_view', name='random'),
)
