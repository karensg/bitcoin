package bitcoin;


import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author karensg
 */
public class Blocks {
    
   public static void main(String[] args) throws IOException, JSONException, InterruptedException {
       
   
       //Get last block
       JSONObject blocks = WebApi.readJsonFromUrl("http://blockchain.info/blocks/0?format=json");
       
       //System.out.println(blocks.toString());
       
       JSONObject invData = new JSONObject();
       
       JSONObject json;
       JSONObject block;
       //Get the data
       for (Integer i=0; i < blocks.getJSONArray("blocks").length(); i++) {
           block = (JSONObject) blocks.getJSONArray("blocks").get(i);
           json = WebApi.readJsonFromUrl("http://blockchain.info/inv/" + block.getString("hash") + "?format=json");
           invData.put(i.toString(), json);
           System.out.println(blocks.getJSONArray("blocks").length() - i + ": " +json.toString());
           //Thread.sleep(500);
       }
       
       //Pare useful information
       JSONObject inventory;
       JSONArray usefulData = new JSONArray("[blocks]");
       for (Integer i=0; i < invData.length(); i++) {
           inventory = invData.getJSONObject(i.toString());
           
           JSONObject blockinfo = new JSONObject();
           blockinfo.put("hash",inventory.get("hash"));
           blockinfo.put("relayed_percent",inventory.get("relayed_percent"));
           blockinfo.put("initial_time",inventory.get("initial_time"));
           blockinfo.put("relayed_count",inventory.get("relayed_count"));
           blockinfo.put("initial_ip",inventory.get("initial_ip"));
           
           JSONArray owners = (JSONArray)inventory.getJSONArray("probable_owners");
           for(Integer k = 0; k < owners.length(); k++) {
               JSONObject owner = owners.getJSONObject(k);
               if(!owner.getString("ip").equals("0.0.0.0")){
                   blockinfo.put("owner",owner.getString("ip"));
                   blockinfo.put("confidence",owner.getInt("confidence"));
                   break;
               }
           }
           blockinfo.put("relayed_count",inventory.get("relayed_count"));
           
           usefulData.put(i,blockinfo);
       }
       
       
       //write to json file
       try {
 
		FileWriter file = new FileWriter("../../js/block_data.js", false);
                file.write("blocksjson = ");
		file.write(usefulData.toString());
                file.write(";");
		file.flush();
		file.close();
 
	} catch (IOException e) {
		e.printStackTrace();
	}

        
        
  }
}
