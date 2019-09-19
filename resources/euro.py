from mpl_toolkits.basemap import Basemap
import numpy as np
import matplotlib.pyplot as plt
plt.figure(figsize=(15.3,9.0))
plt.subplots_adjust(left=0.0, right=1.0, top=1.0, bottom=0)
# llcrnrlat,llcrnrlon,urcrnrlat,urcrnrlon
# are the lat/lon values of the lower left and upper right corners
# of the map.
# lat_ts is the latitude of true scale.
# resolution = 'c' means use crude resolution coastlines.
m = Basemap(projection='merc',llcrnrlat=22,urcrnrlat=62,\
            llcrnrlon=-14,urcrnrlon=83,lat_ts=0,resolution='i')
m.drawcoastlines()
m.drawcountries()
# m.drawstates(color='red', linewidth=0.2)
m.fillcontinents(color='coral',lake_color='aqua')
# draw parallels and meridians.
#m.drawparallels(np.arange(-90.,91.,30.))
#m.drawmeridians(np.arange(-180.,181.,60.))
m.drawmapboundary(fill_color='aqua')
#plt.show()
plt.savefig('euro.png')
