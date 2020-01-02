from mpl_toolkits.basemap import Basemap
import matplotlib.pyplot as plt
import numpy as np

lon_viewing_angle=0
fig = plt.figure(figsize=(5,5))
#print(lon_viewing_angle)
# set perspective angle
lat_viewing_angle = 40
#lon_viewing_angle = -180

# define color maps for water and land
ocean_map = (plt.get_cmap('ocean'))(210)
cmap = plt.get_cmap('gist_earth')

# call the basemap and use orthographic projection at viewing angle
m = Basemap(projection='ortho', 
          lat_0=lat_viewing_angle, lon_0=lon_viewing_angle)    

# coastlines, map boundary, fill continents/water, fill ocean, draw countries
#m.drawcoastlines()
m.drawmapboundary(fill_color=ocean_map)
m.fillcontinents(color=cmap(200),lake_color=ocean_map)
#m.drawcountries()

# latitude/longitude line vectors
lat_line_range = [-90,90]
lat_lines = 3
lat_line_count = (lat_line_range[1]-lat_line_range[0])/lat_lines

merid_range = [-180,180]
merid_lines = 3
merid_count = (merid_range[1]-merid_range[0])/merid_lines

#m.drawparallels(np.arange(lat_line_range[0],lat_line_range[1],lat_line_count))
#m.drawmeridians(np.arange(merid_range[0],merid_range[1],merid_count))

# save figure at 150 dpi and show it
plt.savefig('ogimage.png',dpi=500,transparent=True)
#plt.show()
plt.clf()
