package bitcoin;


import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
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
           Thread.sleep(500);
       }
       
       //Pare useful information
       
       
       //write to json file
       try {
 
		FileWriter file = new FileWriter("../../blocks.json", false);
		file.write(invData.toString());
		file.flush();
		file.close();
 
	} catch (IOException e) {
		e.printStackTrace();
	}

        
        
  }
}
