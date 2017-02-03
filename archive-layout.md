# Page Freezer Archive Layout

The archives we get from Pagefreezer are zipballs. Each Page Freezer archive for a domain BASEURL consists of a zipfile with the following structure:

Base URL is 
`storage/export/climate/BASEURL_NUMERICALID_YYYY-MM-DD/http[s]_URL/`

inside this you'll find a file: 
`http[s]_URL_MM_DD_YYYY.xml`

and a directory 
`MM_DD_YYYY/`
potentially containing multiple subdirs of the form:
`http[s]_URL`
where URL is either the BASEURL or an external domain cantaining resources linked from BASEURL pages.

First thing we need to do is to to understand the xml format -- here's an example document (rename with the .xml extension, Github doesn't allow upload of xml files):
[http_www.climateandsatellites.org_01_20_2017.txt](https://github.com/edgi-govdata-archiving/page-freezer-cli/files/747980/http_www.climateandsatellites.org_01_20_2017.txt)


